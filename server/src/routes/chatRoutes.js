const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { chatUpload } = require('../services/chatStorageService');

router.use(authenticate);

// Conversations
router.get('/conversations', chatController.getMyConversations);
router.post('/conversations', chatController.getOrCreateConversation);
router.get('/conversations/:id', chatController.getConversationById);

// Messaging & Image Upload
router.post('/conversations/:id/messages', chatUpload.single('image'), chatController.sendMessage);

// In-Chat Verification Flow
router.post('/conversations/:id/request-verification', chatController.requestVerification);
router.post('/conversations/:id/submit-verification', chatController.submitVerificationProof);
router.put('/conversations/:id/verify-owner', chatController.verifyOwner);

// Two-Sided Resolution Flow
router.put('/conversations/:id/mark-returned', chatController.markAsReturned);
router.put('/conversations/:id/confirm-return', chatController.confirmReturn);

// Dispute Escalation
router.put('/conversations/:id/dispute', chatController.reportDispute);

// Admin Dispute Management
router.get('/disputes', authorize(['ADMIN', 'VERIFIER']), chatController.getDisputes);

module.exports = router;
