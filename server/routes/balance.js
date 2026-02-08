const express = require('express');
const { getBalance } = require('../controllers/balanceController');

const router = express.Router();

router.get('/', getBalance);

module.exports = router;