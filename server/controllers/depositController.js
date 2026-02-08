const Deposit= require('../models/Deposit');
const Balance = require('../models/Balance');
const Expense = require('../models/Expense');

// GET all deposits
const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find().sort({ date: -1 });
    const totalAmount = deposits.reduce((sum, item) => sum + Number(item.amount), 0);

    res.json({ deposits, totalAmount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) return res.status(404).json({ message: 'Deposit not found' });
    res.json(deposit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createDeposit = async (req, res) => {
  try {
    const { name, amount, date } = req.body;
    if (!name || !amount) return res.status(400).json({ message: "Name and amount required" });

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0)
      return res.status(400).json({ message: "Valid positive amount required" });

    const newDeposit = await Deposit.create({
      name,
      amount: amountNumber,
      date: date || new Date(),
    });

    let balance = await Balance.findOne();
    if (!balance) {
      balance = new Balance({ capitalAmount: amountNumber, currentAmount: amountNumber });
    } else {
      balance.capitalAmount += amountNumber;
      balance.currentAmount += amountNumber;
    }
    await balance.save();

    res.status(201).json(newDeposit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const updateDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) return res.status(404).json({ message: "Deposit not found" });

    const oldAmount = Number(deposit.amount);
    const newAmount = Number(req.body.amount);

    if (isNaN(newAmount) || newAmount <= 0)
      return res.status(400).json({ message: "Valid positive amount required" });

    const difference = newAmount - oldAmount;

    const balance = await Balance.findOne();
    if (!balance) return res.status(500).json({ message: 'Balance not found' });

    if (difference < 0) {
      const reduce = -difference;
      if (balance.currentAmount < reduce) {
        return res.status(400).json({ message: 'Cannot reduce deposit: insufficient current balance' });
      }
      if (balance.capitalAmount < reduce) {
        return res.status(400).json({ message: 'Cannot reduce deposit: insufficient capital balance' });
      }
    }

    deposit.name = req.body.name || deposit.name;
    deposit.amount = newAmount;
    deposit.date = req.body.date || deposit.date;
    await deposit.save();

    balance.capitalAmount += difference;
    balance.currentAmount += difference;
    if (balance.currentAmount < 0) balance.currentAmount = 0; // Safety net
    if (balance.capitalAmount < 0) balance.capitalAmount = 0; // Safety net
    await balance.save();

    res.json(deposit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const deleteDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    const amountToSubtract = Number(deposit.amount);

    // Check if any expense exists at all
    const anyExpenseExists = await Expense.countDocuments();

    if (anyExpenseExists > 0) {
      return res.status(400).json({
        message: 'Cannot delete deposit: Expenses have been recorded. Delete or adjust expenses first.',
      });
    }

    // Optional: Extra safety (though not needed if no expenses)
    const balance = await Balance.findOne();
    if (!balance) {
      return res.status(500).json({ message: 'Balance not found' });
    }

    // This should always be true if no expenses exist
    if (balance.currentAmount < amountToSubtract || balance.capitalAmount < amountToSubtract) {
      return res.status(400).json({
        message: 'Cannot delete deposit: Balance inconsistency detected.',
      });
    }

    // Safe to delete
    await deposit.deleteOne();

    balance.capitalAmount -= amountToSubtract;
    balance.currentAmount -= amountToSubtract;
    await balance.save();

    res.json({ message: 'Deposit deleted successfully' });
  } catch (err) {
    console.error('Delete deposit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteManyDeposits = async (req, res) => {
  try {
    const { ids } = req.body; // Expect: { ids: ["id1", "id2", ...] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No deposit IDs provided" });
    }

    // Fetch all deposits to be deleted
    const deposits = await Deposit.find({ _id: { $in: ids } });
    if (deposits.length === 0) {
      return res.status(404).json({ message: "No deposits found" });
    }

    // SAFETY CHECK: Block if any expense exists
    const expenseCount = await Expense.countDocuments();
    if (expenseCount > 0) {
      return res.status(400).json({
        message: "Cannot delete deposits: Expenses have been recorded. Delete all expenses first.",
        failedIds: ids,
      });
    }

    // Calculate total amount to subtract
    const totalAmountToSubtract = deposits.reduce((sum, d) => sum + Number(d.amount), 0);

    const balance = await Balance.findOne();
    if (!balance) {
      return res.status(500).json({ message: "Balance record missing" });
    }

    // Check if enough balance exists
    if (
      balance.currentAmount < totalAmountToSubtract ||
      balance.capitalAmount < totalAmountToSubtract
    ) {
      return res.status(400).json({
        message: "Cannot delete: One or more deposits have already been spent.",
        failedIds: ids,
      });
    }

    // All safe → Delete all
    await Deposit.deleteMany({ _id: { $in: ids } });

    // Update balance
    balance.capitalAmount -= totalAmountToSubtract;
    balance.currentAmount -= totalAmountToSubtract;
    await balance.save();

    res.json({
      message: `${deposits.length} deposit(s) deleted successfully`,
      deletedCount: deposits.length,
      deletedIds: deposits.map(d => d._id),
    });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({ message: "Server error during bulk delete" });
  }
};

module.exports = {
  getAllDeposits,
  getDeposit,
  createDeposit,
  updateDeposit,
  deleteDeposit,
  deleteManyDeposits
};
