const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

router.get('/stats', blockchainController.getNetworkStats);
router.get('/blocks', blockchainController.getTransactions);
router.get('/asset/:assetId', blockchainController.getAssetBlockchain);
router.post('/verify-hash', blockchainController.verifyHash);

module.exports = router;
