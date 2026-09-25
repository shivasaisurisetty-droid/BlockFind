const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', assetController.getAssets);
router.get('/my', authenticate, assetController.getMyAssets);
router.get('/:id', assetController.getAssetById);
router.post('/', authenticate, upload.single('image'), assetController.createAsset);
router.put('/:id', authenticate, upload.single('image'), assetController.updateAsset);

module.exports = router;
