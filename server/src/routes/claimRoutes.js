const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

router.get('/', authenticate, claimController.getClaims);
router.get('/:id', authenticate, claimController.getClaimById);
router.post('/', authenticate, upload.single('proofDocument'), claimController.createClaim);
router.put('/:id/approve', authenticate, authorize(['VERIFIER', 'ADMIN']), claimController.approveClaim);
router.put('/:id/reject', authenticate, authorize(['VERIFIER', 'ADMIN']), claimController.rejectClaim);

module.exports = router;
