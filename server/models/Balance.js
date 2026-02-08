const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  capitalAmount: {
    type: Number,
    default: 0,
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Ensure only one balance document exists (singleton-like)
const Balance = mongoose.models.Balance || mongoose.model('Balance', balanceSchema);

module.exports = Balance;