const Expense = require('../models/Expense');
const Balance = require('../models/Balance');

// GET all expenses
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });

    const totalExpense = expenses.reduce((sum, item) => {
      return sum + Number(item.amount);
    }, 0);

    res.json({
      totalExpense,
      expenses
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET single expense
const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createExpense = async (req, res) => {
  const { description, amount, paidBy, date } = req.body;
  try {
    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ message: 'Valid positive amount required' });
    }

    const balance = await Balance.findOne();
    if (!balance || balance.currentAmount < amountNumber) {
      return res.status(400).json({ message: 'Insufficient current balance' });
    }

    const newExpense = new Expense({ description, amount: amountNumber, paidBy, date });
    await newExpense.save();

    balance.currentAmount -= amountNumber;
    await balance.save();

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update expense (adjust diff in balance with checks)
const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { description, amount, paidBy, date } = req.body;
  try {
    const expense = await Expense.findById(id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const newAmount = Number(amount);
    if (isNaN(newAmount) || newAmount <= 0) {
      return res.status(400).json({ message: 'Valid positive amount required' });
    }

    const amountDiff = newAmount - expense.amount;

    const balance = await Balance.findOne();
    if (!balance) return res.status(500).json({ message: 'Balance not found' });

    if (amountDiff > 0) {
      if (balance.currentAmount < amountDiff) {
        return res.status(400).json({ message: 'Insufficient current balance for increase' });
      }
    }

    expense.description = description || expense.description;
    expense.amount = newAmount;
    expense.paidBy = paidBy || expense.paidBy;
    expense.date = date || expense.date;
    await expense.save();

    balance.currentAmount -= amountDiff;
    if (balance.currentAmount < 0) balance.currentAmount = 0; // Safety net
    await balance.save();

    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE expense (add back to balance)
const deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const expense = await Expense.findById(id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const amountToAddBack = Number(expense.amount);

    await expense.deleteOne();

    const balance = await Balance.findOne();
    if (balance) {
      balance.currentAmount += amountToAddBack;
      await balance.save();
    }

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteManyExpenses = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No expense IDs provided" });
    }

    // Find all expenses to be deleted
    const expenses = await Expense.find({ _id: { $in: ids } });
    if (expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found with provided IDs" });
    }

    // Calculate total amount to ADD BACK to balance
    const totalAmountToRefund = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Get current balance
    const balance = await Balance.findOne();
    if (!balance) {
      return res.status(500).json({ message: "Balance record not found" });
    }

    // Perform the deletion
    await Expense.deleteMany({ _id: { $in: ids } });

    // Refund the money back to balance (since expense is removed)
    balance.currentAmount += totalAmountToRefund;
    // Optional: You might also want to adjust capital if needed — usually not
    // balance.capitalAmount += totalAmountToRefund; // Only if you track spent capital separately

    await balance.save();

    res.json({
      message: `${expenses.length} expense(s) deleted and balance updated`,
      deletedCount: expenses.length,
      refundedAmount: totalAmountToRefund,
      deletedIds: expenses.map(e => e._id.toString()),
    });
  } catch (err) {
    console.error("Bulk delete expenses error:", err);
    res.status(500).json({ message: "Server error during bulk delete" });
  }
};

module.exports = {
  getAllExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  deleteManyExpenses
};
