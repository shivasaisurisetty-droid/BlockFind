const prisma = require('../config/db');
const crypto = require('crypto');
const { sha256 } = require('../utils/cryptoUtils');
const auditService = require('./auditService');
const notificationService = require('./notificationService');
const blockchainService = require('./blockchainService');

/**
 * Generate privacy-preserving anonymous alias (e.g. BlockFind User #A72F)
 */
function getAnonymousAlias(userId) {
  if (!userId) return 'System Automated';
  const hash = crypto.createHash('md5').update(userId).digest('hex').toUpperCase();
  return `BlockFind User #${hash.substring(0, 4)}`;
}

class ChatService {
  /**
   * Start or retrieve existing conversation for a Lost or Found item
   */
  async getOrCreateConversation({ lostReportId, foundReportId, currentUserId }) {
    let targetLostReport = null;
    let targetFoundReport = null;
    let otherParticipantId = null;
    let isCurrentUserOwner = true;

    if (foundReportId) {
      targetFoundReport = await prisma.foundReport.findUnique({
        where: { id: foundReportId },
        include: { reporter: true }
      });
      if (!targetFoundReport) throw new Error('Found report not found');
      otherParticipantId = targetFoundReport.reporterId;
      isCurrentUserOwner = currentUserId !== targetFoundReport.reporterId;
    } else if (lostReportId) {
      targetLostReport = await prisma.lostReport.findUnique({
        where: { id: lostReportId },
        include: { reporter: true }
      });
      if (!targetLostReport) throw new Error('Lost report not found');
      otherParticipantId = targetLostReport.reporterId;
      isCurrentUserOwner = currentUserId === targetLostReport.reporterId;
    } else {
      throw new Error('Either lostReportId or foundReportId must be provided');
    }

    if (otherParticipantId === currentUserId) {
      throw new Error('Cannot start conversation with yourself');
    }

    // Check if conversation already exists between these users for these reports
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participantOneId: currentUserId,
            participantTwoId: otherParticipantId,
            foundReportId: foundReportId || undefined,
            lostReportId: lostReportId || undefined
          },
          {
            participantOneId: otherParticipantId,
            participantTwoId: currentUserId,
            foundReportId: foundReportId || undefined,
            lostReportId: lostReportId || undefined
          }
        ]
      },
      include: {
        lostReport: true,
        foundReport: true,
        resolutions: true
      }
    });

    if (!conversation) {
      // Participant One is designated as Claimant / Owner, Participant Two as Finder
      const participantOneId = isCurrentUserOwner ? currentUserId : otherParticipantId;
      const participantTwoId = isCurrentUserOwner ? otherParticipantId : currentUserId;

      conversation = await prisma.conversation.create({
        data: {
          lostReportId: lostReportId || null,
          foundReportId: foundReportId || null,
          participantOneId,
          participantTwoId,
          status: 'ACTIVE'
        },
        include: {
          lostReport: true,
          foundReport: true,
          resolutions: true
        }
      });

      // Send initial SYSTEM greeting message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: null,
          messageType: 'SYSTEM',
          content: '🔒 Secure Anonymous Conversation initialized. Personal contact numbers and real names are concealed for privacy. Use the verification tools above to confirm item ownership.'
        }
      });

      // Audit Log (without private content)
      await auditService.log({
        eventType: 'CONVERSATION_CREATED',
        userId: currentUserId,
        details: `Anonymous secure conversation ${conversation.id} created for case verification`
      });

      // Notify recipient
      await notificationService.notify({
        userId: otherParticipantId,
        title: 'New Secure Message Received',
        message: 'A campus member has initiated a secure inquiry regarding a lost & found item.',
        type: 'INFO',
        linkUrl: `/messages/${conversation.id}`
      });
    }

    return conversation;
  }

  /**
   * Get all active and resolved conversations for the authenticated user
   */
  async getUserConversations(userId) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participantOneId: userId },
          { participantTwoId: userId }
        ]
      },
      include: {
        lostReport: { select: { id: true, itemName: true, category: true, status: true } },
        foundReport: { select: { id: true, itemName: true, category: true, status: true, storageLocation: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        verificationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        resolutions: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Format conversations with privacy pseudonyms & role tags
    return conversations.map(c => {
      const isOwner = c.participantOneId === userId;
      const otherUserId = isOwner ? c.participantTwoId : c.participantOneId;
      const otherAlias = getAnonymousAlias(otherUserId);
      const otherRole = isOwner ? 'Finder' : 'Lost Item Owner';
      const myRole = isOwner ? 'Lost Item Owner' : 'Finder';
      const latestMessage = c.messages[0] || null;
      const latestVerification = c.verificationRequests[0] || null;
      const resolution = c.resolutions[0] || null;

      const itemTitle = c.foundReport?.itemName || c.lostReport?.itemName || 'Lost & Found Asset';
      const itemCategory = c.foundReport?.category || c.lostReport?.category || 'GENERAL';

      return {
        id: c.id,
        status: c.status,
        itemTitle,
        itemCategory,
        lostReportId: c.lostReportId,
        foundReportId: c.foundReportId,
        myRole,
        otherUser: {
          alias: otherAlias,
          roleTitle: otherRole
        },
        latestMessage: latestMessage ? {
          content: latestMessage.messageType === 'IMAGE' ? '📷 Image attachment' : latestMessage.content,
          messageType: latestMessage.messageType,
          createdAt: latestMessage.createdAt,
          isMine: latestMessage.senderId === userId
        } : null,
        verificationStatus: latestVerification ? latestVerification.status : 'NONE',
        resolutionStatus: resolution ? resolution.status : 'PENDING',
        updatedAt: c.updatedAt
      };
    });
  }

  /**
   * Get single conversation with full message thread, verification state, and resolution details
   */
  async getConversationDetails(conversationId, userId, userRole = 'USER') {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        lostReport: {
          include: { reporter: { select: { id: true, name: true, organization: true } } }
        },
        foundReport: {
          include: { reporter: { select: { id: true, name: true, organization: true } } }
        },
        participantOne: { select: { id: true, name: true, email: true, phone: true, organization: true } },
        participantTwo: { select: { id: true, name: true, email: true, phone: true, organization: true } },
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        verificationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        resolutions: true
      }
    });

    if (!conversation) throw new Error('Conversation not found');

    const isParticipant = conversation.participantOneId === userId || conversation.participantTwoId === userId;
    const isStaff = userRole === 'ADMIN' || userRole === 'VERIFIER';

    if (!isParticipant && !isStaff) {
      throw new Error('Unauthorized: You are not a participant in this conversation.');
    }

    // Mark unread messages sent by the other user as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    const isOwner = conversation.participantOneId === userId;
    const otherUserId = isOwner ? conversation.participantTwoId : conversation.participantOneId;
    const otherUserRaw = isOwner ? conversation.participantTwo : conversation.participantOne;

    const formattedMessages = conversation.messages.map(m => {
      let senderAlias = 'System';
      let isMine = false;

      if (m.senderId) {
        isMine = m.senderId === userId;
        senderAlias = isMine ? 'You' : getAnonymousAlias(m.senderId);
      }

      return {
        id: m.id,
        senderId: m.senderId,
        senderAlias,
        messageType: m.messageType,
        content: m.content,
        attachmentUrl: m.attachmentUrl,
        isMine,
        isRead: m.isRead,
        createdAt: m.createdAt
      };
    });

    const latestVerification = conversation.verificationRequests[0] || null;
    const resolution = conversation.resolutions[0] || null;
    const itemTitle = conversation.foundReport?.itemName || conversation.lostReport?.itemName || 'Lost & Found Item';

    return {
      id: conversation.id,
      status: conversation.status,
      itemTitle,
      lostReport: conversation.lostReport,
      foundReport: conversation.foundReport,
      myRole: isOwner ? 'Lost Item Owner' : 'Finder',
      isOwner,
      otherParticipant: {
        alias: getAnonymousAlias(otherUserId),
        roleTitle: isOwner ? 'Finder' : 'Lost Item Owner',
        // Real identities only exposed if Staff (Admin/Verifier) inspecting a dispute
        realIdentity: isStaff ? {
          name: otherUserRaw?.name,
          email: otherUserRaw?.email,
          phone: otherUserRaw?.phone,
          organization: otherUserRaw?.organization
        } : null
      },
      messages: formattedMessages,
      verificationRequest: latestVerification,
      resolution,
      createdAt: conversation.createdAt
    };
  }

  /**
   * Send a text message or image attachment
   */
  async sendMessage({ conversationId, senderId, content, attachmentUrl, messageType = 'TEXT' }) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) throw new Error('Conversation not found');

    const isParticipant = conversation.participantOneId === senderId || conversation.participantTwoId === senderId;
    if (!isParticipant) throw new Error('Unauthorized to post messages to this conversation');

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        messageType,
        content: content || (messageType === 'IMAGE' ? 'Image Attachment' : ''),
        attachmentUrl: attachmentUrl || null
      }
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Determine recipient
    const recipientId = conversation.participantOneId === senderId
      ? conversation.participantTwoId
      : conversation.participantOneId;

    // Send notification
    await notificationService.notify({
      userId: recipientId,
      title: 'New Secure Message',
      message: messageType === 'IMAGE' ? 'You received a new image attachment.' : `New message: "${content.substring(0, 40)}..."`,
      type: 'INFO',
      linkUrl: `/messages/${conversationId}`
    });

    // Audit Log (Metadata only, zero private content stored)
    await auditService.log({
      eventType: messageType === 'IMAGE' ? 'IMAGE_SHARED' : 'MESSAGE_SENT',
      userId: senderId,
      details: `Message sent in conversation ${conversationId}`
    });

    return message;
  }

  /**
   * Finder requests ownership verification with questions/checklist
   */
  async requestVerification({ conversationId, requestedBy, checklistItems, evidenceDescription }) {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new Error('Conversation not found');

    const verReq = await prisma.verificationRequest.create({
      data: {
        conversationId,
        requestedBy,
        checklistItems: typeof checklistItems === 'string' ? checklistItems : JSON.stringify(checklistItems || []),
        evidenceDescription: evidenceDescription || null,
        status: 'PENDING'
      }
    });

    // Post SYSTEM message in chat
    await prisma.message.create({
      data: {
        conversationId,
        senderId: null,
        messageType: 'SYSTEM',
        content: '📋 Finder has requested Ownership Verification. Please review the checklist and submit proof details or reference photographs.'
      }
    });

    const recipientId = conversation.participantOneId === requestedBy ? conversation.participantTwoId : conversation.participantOneId;
    await notificationService.notify({
      userId: recipientId,
      title: 'Ownership Verification Requested',
      message: 'The finder has asked for identifying proof to verify your ownership.',
      type: 'ACTION_REQUIRED',
      linkUrl: `/messages/${conversationId}`
    });

    await auditService.log({
      eventType: 'VERIFICATION_REQUESTED',
      userId: requestedBy,
      details: `Verification request initiated in conversation ${conversationId}`
    });

    return verReq;
  }

  /**
   * Owner submits verification proof
   */
  async submitVerificationProof({ conversationId, submittedBy, evidenceDescription }) {
    const latestReq = await prisma.verificationRequest.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestReq) {
      await prisma.verificationRequest.create({
        data: {
          conversationId,
          requestedBy: submittedBy,
          evidenceDescription,
          status: 'PENDING'
        }
      });
    } else {
      await prisma.verificationRequest.update({
        where: { id: latestReq.id },
        data: { evidenceDescription }
      });
    }

    await prisma.message.create({
      data: {
        conversationId,
        senderId: null,
        messageType: 'SYSTEM',
        content: '📝 Ownership verification proof details submitted by claimant. Finder may now inspect evidence and verify.'
      }
    });

    return { success: true };
  }

  /**
   * Finder confirms verification of genuine owner
   */
  async verifyOwner({ conversationId, verifierId }) {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new Error('Conversation not found');

    const latestReq = await prisma.verificationRequest.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' }
    });

    if (latestReq) {
      await prisma.verificationRequest.update({
        where: { id: latestReq.id },
        data: { status: 'VERIFIED' }
      });
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'VERIFIED' }
    });

    // Create system notification message in chat
    await prisma.message.create({
      data: {
        conversationId,
        senderId: null,
        messageType: 'SYSTEM',
        content: '🟢 Finder confirmed and verified the claimant as the legitimate owner! Item is cleared for physical return.'
      }
    });

    // Notify Owner
    await notificationService.notify({
      userId: conversation.participantOneId,
      title: 'Ownership Verified! 🎉',
      message: 'The finder has verified your ownership. Please coordinate return.',
      type: 'SUCCESS',
      linkUrl: `/messages/${conversationId}`
    });

    await auditService.log({
      eventType: 'OWNERSHIP_VERIFIED',
      userId: verifierId,
      details: `Owner verified in conversation ${conversationId}`
    });

    return { success: true, status: 'VERIFIED' };
  }

  /**
   * Finder marks item as physically returned (Step 1 of two-sided resolution)
   */
  async markAsReturned({ conversationId, finderId }) {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new Error('Conversation not found');

    await prisma.caseResolution.upsert({
      where: { conversationId },
      create: {
        conversationId,
        finderConfirmed: true,
        ownerConfirmed: false,
        status: 'RETURN_PENDING_OWNER_CONFIRMATION'
      },
      update: {
        finderConfirmed: true,
        status: 'RETURN_PENDING_OWNER_CONFIRMATION'
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'RETURN_PENDING' }
    });

    // Post SYSTEM message in chat
    await prisma.message.create({
      data: {
        conversationId,
        senderId: null,
        messageType: 'SYSTEM',
        content: '📦 Finder marked the item as RETURNED. Awaiting final receipt confirmation from the owner.'
      }
    });

    // Notify Owner to confirm receipt
    await notificationService.notify({
      userId: conversation.participantOneId,
      title: 'Action Required: Confirm Item Receipt',
      message: 'The finder reported that your item was returned. Please confirm receipt to complete resolution.',
      type: 'ACTION_REQUIRED',
      linkUrl: `/messages/${conversationId}`
    });

    await auditService.log({
      eventType: 'RETURN_REQUESTED',
      userId: finderId,
      details: `Finder initiated return confirmation for conversation ${conversationId}`
    });

    return { success: true, status: 'RETURN_PENDING_OWNER_CONFIRMATION' };
  }

  /**
   * Owner confirms receipt (Step 2 of two-sided resolution) -> Generates Blockchain Record & Resolves
   */
  async confirmReturn({ conversationId, ownerId }) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        lostReport: true,
        foundReport: true
      }
    });
    if (!conversation) throw new Error('Conversation not found');

    const itemDesc = conversation.foundReport?.itemName || conversation.lostReport?.itemName || 'Recovered Item';

    // 1. Stamp on Blockchain
    const bcResult = await blockchainService.recordCaseVerificationAndResolution({
      conversationId,
      itemDescription: itemDesc,
      ownerId: conversation.participantOneId,
      finderId: conversation.participantTwoId,
      proofSummary: 'Peer Verified & Two-Sided Confirmed Return',
      isRegistered: !!conversation.lostReport?.assetId,
      assetId: conversation.lostReport?.assetId || null
    });

    // 2. Update Resolution Record
    const resolution = await prisma.caseResolution.upsert({
      where: { conversationId },
      create: {
        conversationId,
        finderConfirmed: true,
        ownerConfirmed: true,
        status: 'RESOLVED',
        blockchainTxHash: bcResult.txHash,
        resolvedAt: new Date()
      },
      update: {
        ownerConfirmed: true,
        status: 'RESOLVED',
        blockchainTxHash: bcResult.txHash,
        resolvedAt: new Date()
      }
    });

    // 3. Update Conversation Status
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'RESOLVED' }
    });

    // 4. Update reports and assets to RESOLVED (Disappear from active search)
    if (conversation.foundReportId) {
      await prisma.foundReport.update({
        where: { id: conversation.foundReportId },
        data: { status: 'RESOLVED' }
      });
    }
    if (conversation.lostReportId) {
      await prisma.lostReport.update({
        where: { id: conversation.lostReportId },
        data: { status: 'RESOLVED' }
      });
    }

    // 5. Post final SYSTEM message in chat
    await prisma.message.create({
      data: {
        conversationId,
        senderId: null,
        messageType: 'SYSTEM',
        content: `🎉 Case Successfully Resolved! Ownership verified, item safely returned, and transaction permanently stamped onto the blockchain ledger (Tx: ${bcResult.txHash.substring(0, 16)}... Block #${bcResult.blockNumber}).`
      }
    });

    // 6. Notify Finder of successful resolution
    await notificationService.notify({
      userId: conversation.participantTwoId,
      title: 'Case Successfully Resolved! 🎉',
      message: `The owner confirmed receipt of "${itemDesc}". Thank you for your honesty and community service!`,
      type: 'SUCCESS',
      linkUrl: `/messages/${conversationId}`
    });

    // 7. Audit Logs
    await auditService.log({
      eventType: 'OWNER_CONFIRMED_RETURN',
      userId: ownerId,
      details: `Owner confirmed receipt for case ${conversationId}`,
      blockchainTxHash: bcResult.txHash
    });

    await auditService.log({
      eventType: 'CASE_RESOLVED',
      userId: ownerId,
      details: `Case ${conversationId} fully resolved on ledger`,
      blockchainTxHash: bcResult.txHash
    });

    return {
      success: true,
      status: 'RESOLVED',
      resolution,
      blockchain: {
        txHash: bcResult.txHash,
        blockNumber: bcResult.blockNumber
      }
    };
  }

  /**
   * Report Dispute / Problem to Admin
   */
  async reportDispute({ conversationId, reportedBy, disputeReason }) {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new Error('Conversation not found');

    await prisma.caseResolution.upsert({
      where: { conversationId },
      create: {
        conversationId,
        status: 'DISPUTED',
        disputeReason
      },
      update: {
        status: 'DISPUTED',
        disputeReason
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'DISPUTED' }
    });

    await prisma.message.create({
      data: {
        conversationId,
        senderId: null,
        messageType: 'SYSTEM',
        content: `⚠️ A dispute was reported: "${disputeReason}". An authorized campus verifier/admin has been notified.`
      }
    });

    // Notify Admins and Verifiers
    await notificationService.notifyRole({
      role: 'ADMIN',
      title: 'Disputed Lost & Found Case Escalated',
      message: `A dispute was filed in case ${conversationId}. Reason: ${disputeReason}`,
      type: 'WARNING',
      linkUrl: `/admin`
    });

    await auditService.log({
      eventType: 'CASE_DISPUTED',
      userId: reportedBy,
      details: `Dispute filed in conversation ${conversationId}: ${disputeReason}`
    });

    return { success: true, status: 'DISPUTED' };
  }

  /**
   * Admin view of all disputed conversations
   */
  async getDisputedConversations() {
    return prisma.conversation.findMany({
      where: { status: 'DISPUTED' },
      include: {
        participantOne: { select: { id: true, name: true, email: true, phone: true } },
        participantTwo: { select: { id: true, name: true, email: true, phone: true } },
        lostReport: true,
        foundReport: true,
        resolutions: true,
        messages: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }
}

module.exports = new ChatService();
