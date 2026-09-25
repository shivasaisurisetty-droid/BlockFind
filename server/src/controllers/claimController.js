const prisma = require('../config/db');
const { generateClaimId } = require('../utils/idGenerator');
const auditService = require('../services/auditService');
const notificationService = require('../services/notificationService');
const blockchainService = require('../services/blockchainService');
const { getStorageService } = require('../services/storageService');

const storageService = getStorageService();

/**
 * Submit an ownership claim for a found item
 */
exports.createClaim = async (req, res, next) => {
  try {
    const {
      foundReportId,
      assetId,
      claimReason,
      identificationDetails,
      additionalProof,
      contactPhone
    } = req.body;

    if (!foundReportId || !claimReason || !identificationDetails || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Found report ID, claim reason, identification details, and contact phone are required.'
      });
    }

    const foundReport = await prisma.foundReport.findUnique({
      where: { id: foundReportId }
    });

    if (!foundReport) {
      return res.status(404).json({ success: false, message: 'Found report item not found.' });
    }

    const claimId = generateClaimId();
    let proofDocumentUrl = null;

    if (req.file) {
      proofDocumentUrl = await storageService.uploadFile(req.file);
    }

    const claim = await prisma.claim.create({
      data: {
        id: claimId,
        foundReportId,
        assetId: assetId || null,
        claimantId: req.user.id,
        claimReason: claimReason.trim(),
        identificationDetails: identificationDetails.trim(),
        proofDocumentUrl,
        additionalProof: additionalProof ? additionalProof.trim() : null,
        contactPhone: contactPhone.trim(),
        status: 'PENDING_VERIFICATION'
      },
      include: {
        foundReport: true,
        claimant: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Update found report status
    await prisma.foundReport.update({
      where: { id: foundReportId },
      data: { status: 'CLAIM_PENDING' }
    });

    // Audit Log
    await auditService.log({
      eventType: 'CLAIM_SUBMITTED',
      userId: req.user.id,
      assetId: assetId || null,
      details: `Ownership claim ${claim.id} filed for item "${foundReport.itemName}" (${foundReport.id})`,
      ipAddress: req.ip
    });

    // Claimant Notification
    await notificationService.notify({
      userId: req.user.id,
      title: 'Ownership Claim Submitted',
      message: `Your ownership claim (${claim.id}) for "${foundReport.itemName}" has been submitted for verification. An authorized verifier will review your proof.`,
      type: 'INFO',
      linkUrl: `/claims/${claim.id}`
    });

    // Verifier Notification
    await notificationService.notifyRole({
      role: 'VERIFIER',
      title: 'New Ownership Claim Pending Review',
      message: `User ${req.user.name} submitted a claim (${claim.id}) for "${foundReport.itemName}". Evidence is awaiting verification.`,
      type: 'ACTION_REQUIRED',
      linkUrl: `/claims/${claim.id}`
    });

    return res.status(201).json({
      success: true,
      message: 'Your ownership claim has been submitted for verification.',
      claimId: claim.id,
      timestamp: claim.createdAt,
      claim
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get claims (Filtered for regular users vs verifiers/admins)
 */
exports.getClaims = async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const where = {};
    if (status && status !== 'ALL') where.status = status.toUpperCase();

    // Regular users only see their own submitted claims
    if (req.user.role === 'USER') {
      where.claimantId = req.user.id;
    }

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        include: {
          claimant: {
            select: { id: true, name: true, email: true, phone: true, organization: true }
          },
          verifier: {
            select: { id: true, name: true, email: true, role: true }
          },
          foundReport: true,
          asset: {
            select: { id: true, name: true, serialNumber: true, status: true, currentOwnerId: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }),
      prisma.claim.count({ where })
    ]);

    return res.json({
      success: true,
      claims,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed claim view with complete asset & verification history
 */
exports.getClaimById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        claimant: {
          select: { id: true, name: true, email: true, phone: true, organization: true, createdAt: true }
        },
        verifier: {
          select: { id: true, name: true, email: true, role: true }
        },
        foundReport: {
          include: {
            reporter: { select: { id: true, name: true, email: true } }
          }
        },
        asset: {
          include: {
            currentOwner: { select: { id: true, name: true, email: true } },
            ownershipHistory: {
              include: {
                previousOwner: { select: { id: true, name: true } },
                newOwner: { select: { id: true, name: true } }
              },
              orderBy: { timestamp: 'desc' }
            },
            blockchainTxs: {
              orderBy: { blockTimestamp: 'desc' }
            }
          }
        }
      }
    });

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    // Authorization check
    if (req.user.role === 'USER' && claim.claimantId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this claim.' });
    }

    return res.json({
      success: true,
      claim
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve Ownership Claim (Verifier / Admin only)
 * Transfers asset ownership and generates Blockchain Transaction Record
 */
exports.approveClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verificationRemarks } = req.body;

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        foundReport: true,
        asset: true,
        claimant: true
      }
    });

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    if (claim.status !== 'PENDING_VERIFICATION') {
      return res.status(400).json({ success: false, message: `Claim is already ${claim.status}.` });
    }

    const remarks = verificationRemarks || 'Physical identity and purchase proof verified against campus security registry.';
    let blockchainResult = null;
    let targetAssetId = claim.assetId;

    // If no existing asset was registered beforehand, automatically register asset for claimant
    if (!targetAssetId) {
      const newAsset = await prisma.asset.create({
        data: {
          id: `BF-REC-${Math.floor(10000 + Math.random() * 90000)}`,
          name: claim.foundReport.itemName,
          category: claim.foundReport.category,
          description: claim.foundReport.description,
          status: 'VERIFIED',
          currentOwnerId: claim.claimantId,
          primaryImageUrl: claim.foundReport.imageUrl
        }
      });
      targetAssetId = newAsset.id;

      // Link newly minted asset
      await prisma.claim.update({
        where: { id: claim.id },
        data: { assetId: targetAssetId }
      });
    }

    const previousOwnerId = claim.asset ? claim.asset.currentOwnerId : claim.foundReport.reporterId;

    // 1. Execute Blockchain Ownership Transfer
    blockchainResult = await blockchainService.transferOwnership({
      assetId: targetAssetId,
      fromOwnerId: previousOwnerId,
      toOwnerId: claim.claimantId,
      claimId: claim.id,
      verificationRemarks: remarks
    });

    // 2. Update Asset Ownership & Status
    await prisma.asset.update({
      where: { id: targetAssetId },
      data: {
        currentOwnerId: claim.claimantId,
        status: 'VERIFIED',
        blockchainTxHash: blockchainResult.txHash
      }
    });

    // 3. Record Ownership History
    await prisma.ownershipHistory.create({
      data: {
        assetId: targetAssetId,
        previousOwnerId: previousOwnerId,
        newOwnerId: claim.claimantId,
        transferType: 'CLAIM_VERIFIED_TRANSFER',
        transferReason: `Verified claim ${claim.id}. Remarks: ${remarks}`,
        blockchainTxHash: blockchainResult.txHash
      }
    });

    // 4. Update Claim Status
    const updatedClaim = await prisma.claim.update({
      where: { id: claim.id },
      data: {
        status: 'APPROVED',
        verifierId: req.user.id,
        verificationRemarks: remarks,
        verifiedAt: new Date()
      }
    });

    // 5. Update Found Report Status to RETURNED
    await prisma.foundReport.update({
      where: { id: claim.foundReportId },
      data: { status: 'RETURNED' }
    });

    // 6. Audit Logs
    await auditService.log({
      eventType: 'CLAIM_APPROVED',
      userId: req.user.id,
      assetId: targetAssetId,
      details: `Claim ${claim.id} approved by ${req.user.name}. Remarks: ${remarks}`,
      ipAddress: req.ip,
      blockchainTxHash: blockchainResult.txHash
    });

    await auditService.log({
      eventType: 'OWNERSHIP_TRANSFERRED',
      userId: req.user.id,
      assetId: targetAssetId,
      details: `Ownership transferred to ${claim.claimant.name} for Asset ${targetAssetId}`,
      ipAddress: req.ip,
      blockchainTxHash: blockchainResult.txHash
    });

    // 7. Claimant Notification
    await notificationService.notify({
      userId: claim.claimantId,
      title: 'Ownership Claim Approved! 🎉',
      message: `Your ownership claim (${claim.id}) for "${claim.foundReport.itemName}" has been APPROVED. Ownership has been cryptographically transferred to you on the ledger. You may collect your item from ${claim.foundReport.storageLocation}.`,
      type: 'SUCCESS',
      linkUrl: `/claims/${claim.id}`
    });

    return res.json({
      success: true,
      message: 'Ownership successfully verified and transferred.',
      claim: updatedClaim,
      blockchain: {
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber,
        status: 'CONFIRMED'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Ownership Claim (Verifier / Admin only)
 */
exports.rejectClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        foundReport: true,
        claimant: true
      }
    });

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    if (claim.status !== 'PENDING_VERIFICATION') {
      return res.status(400).json({ success: false, message: `Claim is already ${claim.status}.` });
    }

    // 1. Update claim status
    const updatedClaim = await prisma.claim.update({
      where: { id: claim.id },
      data: {
        status: 'REJECTED',
        verifierId: req.user.id,
        verificationRemarks: rejectionReason.trim(),
        verifiedAt: new Date()
      }
    });

    // 2. Reset Found Report status back to AVAILABLE
    await prisma.foundReport.update({
      where: { id: claim.foundReportId },
      data: { status: 'AVAILABLE' }
    });

    // 3. Audit Log
    await auditService.log({
      eventType: 'CLAIM_REJECTED',
      userId: req.user.id,
      assetId: claim.assetId,
      details: `Claim ${claim.id} rejected by ${req.user.name}. Reason: ${rejectionReason}`,
      ipAddress: req.ip
    });

    // 4. Notify Claimant
    await notificationService.notify({
      userId: claim.claimantId,
      title: 'Ownership Claim Rejected',
      message: `Your ownership claim (${claim.id}) for "${claim.foundReport.itemName}" was rejected. Reason: ${rejectionReason}`,
      type: 'WARNING',
      linkUrl: `/claims/${claim.id}`
    });

    return res.json({
      success: true,
      message: 'Claim has been rejected.',
      claim: updatedClaim
    });
  } catch (error) {
    next(error);
  }
};
