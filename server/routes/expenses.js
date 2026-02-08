const express = require('express');
const {
  getAllExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  deleteManyExpenses
} = require('../controllers/expenseController');

const router = express.Router();

router.delete("/bulk-delete", deleteManyExpenses);
router.get('/', getAllExpenses);
router.get('/:id', getExpense);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
