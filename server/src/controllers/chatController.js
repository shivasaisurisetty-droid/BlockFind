const chatService = require('../services/chatService');
const { chatStorageService } = require('../services/chatStorageService');

/**
 * Get or create conversation from a Lost or Found report
 */
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { lostReportId, foundReportId } = req.body;
    const conversation = await chatService.getOrCreateConversation({
      lostReportId,
      foundReportId,
      currentUserId: req.user.id
    });

    return res.status(201).json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all conversations for current authenticated user
 */
exports.getMyConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getUserConversations(req.user.id);
    return res.json({
      success: true,
      conversations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single conversation details with messages and verification state
 */
exports.getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const details = await chatService.getConversationDetails(id, req.user.id, req.user.role);
    return res.json({
      success: true,
      conversation: details
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send text message or image attachment
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    let attachmentUrl = null;
    let messageType = 'TEXT';

    if (req.file) {
      attachmentUrl = await chatStorageService.saveChatImage(req.file);
      messageType = 'IMAGE';
    }

    if (!content && !attachmentUrl) {
      return res.status(400).json({ success: false, message: 'Message content or image attachment is required.' });
    }

    const message = await chatService.sendMessage({
      conversationId: id,
      senderId: req.user.id,
      content,
      attachmentUrl,
      messageType
    });

    return res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Finder requests ownership verification
 */
exports.requestVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { checklistItems, evidenceDescription } = req.body;

    const request = await chatService.requestVerification({
      conversationId: id,
      requestedBy: req.user.id,
      checklistItems,
      evidenceDescription
    });

    return res.json({
      success: true,
      message: 'Ownership verification requested.',
      verificationRequest: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Owner submits verification proof
 */
exports.submitVerificationProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { evidenceDescription } = req.body;

    const result = await chatService.submitVerificationProof({
      conversationId: id,
      submittedBy: req.user.id,
      evidenceDescription
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Finder confirms owner verification
 */
exports.verifyOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await chatService.verifyOwner({
      conversationId: id,
      verifierId: req.user.id
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Finder marks item as returned
 */
exports.markAsReturned = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await chatService.markAsReturned({
      conversationId: id,
      finderId: req.user.id
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Owner confirms receipt -> Stamped on Blockchain & Resolved
 */
exports.confirmReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await chatService.confirmReturn({
      conversationId: id,
      ownerId: req.user.id
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Report dispute / problem in conversation
 */
exports.reportDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { disputeReason } = req.body;

    if (!disputeReason || !disputeReason.trim()) {
      return res.status(400).json({ success: false, message: 'Dispute reason is required.' });
    }

    const result = await chatService.reportDispute({
      conversationId: id,
      reportedBy: req.user.id,
      disputeReason: disputeReason.trim()
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin view of disputes
 */
exports.getDisputes = async (req, res, next) => {
  try {
    const disputes = await chatService.getDisputedConversations();
    return res.json({
      success: true,
      disputes
    });
  } catch (error) {
    next(error);
  }
};
