const express = require('express');
const {
  getAllDeposits,
  getDeposit,
  createDeposit,
  updateDeposit,
  deleteDeposit,
  deleteManyDeposits
} = require('../controllers/depositController');

const router = express.Router();
router.delete("/bulk-delete", deleteManyDeposits);
router.get('/', getAllDeposits);
router.get('/:id', getDeposit);
router.post('/', createDeposit);
router.put('/:id', updateDeposit);
router.delete('/:id', deleteDeposit);


module.exports = router;
