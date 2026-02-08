const Balance = require('../models/Balance');

// GET balance
const getBalance = async (req, res) => {
  try {
    let balance = await Balance.findOne();
    if (!balance) {
      balance = new Balance({ capitalAmount: 0, currentAmount: 0 });
      await balance.save();
    }
    res.json(balance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getBalance };