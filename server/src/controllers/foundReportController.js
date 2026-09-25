const prisma = require('../config/db');
const { generateFoundReportId } = require('../utils/idGenerator');
const auditService = require('../services/auditService');
const notificationService = require('../services/notificationService');
const blockchainService = require('../services/blockchainService');
const { getStorageService } = require('../services/storageService');

const storageService = getStorageService();

/**
 * Report an item found on campus or facility
 */
exports.createFoundReport = async (req, res, next) => {
  try {
    const {
      itemName,
      category,
      description,
      foundLocation,
      dateFound,
      timeFound,
      storageLocation,
      additionalDetails
    } = req.body;

    if (!itemName || !category || !description || !foundLocation || !dateFound) {
      return res.status(400).json({
        success: false,
        message: 'Item name, category, description, found location, and date found are required.'
      });
    }

    const reportId = generateFoundReportId();
    let imageUrl = null;

    if (req.file) {
      imageUrl = await storageService.uploadFile(req.file);
    }

    const report = await prisma.foundReport.create({
      data: {
        id: reportId,
        itemName: itemName.trim(),
        category: category.toUpperCase().trim(),
        description: description.trim(),
        foundLocation: foundLocation.trim(),
        dateFound: dateFound.trim(),
        timeFound: timeFound || null,
        storageLocation: storageLocation ? storageLocation.trim() : 'Campus Security Desk - Main Block',
        imageUrl,
        additionalDetails: additionalDetails ? additionalDetails.trim() : null,
        reporterId: req.user.id,
        status: 'AVAILABLE'
      }
    });

    // Record on blockchain ledger
    await blockchainService.recordStatusChange({
      assetId: null,
      status: 'FOUND',
      actorId: req.user.id,
      details: `Found report ${report.id} registered for ${report.itemName} at ${report.foundLocation}`
    });

    // Audit Log
    await auditService.log({
      eventType: 'ITEM_REPORTED_FOUND',
      userId: req.user.id,
      details: `Found item recorded: ${report.itemName} (${report.id}) deposited at ${report.storageLocation}`,
      ipAddress: req.ip
    });

    // User Notification
    await notificationService.notify({
      userId: req.user.id,
      title: 'Found Item Successfully Registered',
      message: `Thank you for reporting found item "${report.itemName}" (${report.id}). It is now listed in the registry for claim verification.`,
      type: 'SUCCESS',
      linkUrl: `/found-reports/${report.id}`
    });

    // Notify Verifiers / Security
    await notificationService.notifyRole({
      role: 'VERIFIER',
      title: 'New Found Item Logged',
      message: `Found item "${report.itemName}" (${report.id}) logged at ${report.foundLocation}. Storage: ${report.storageLocation}`,
      type: 'INFO',
      linkUrl: `/found-reports`
    });

    return res.status(201).json({
      success: true,
      message: 'Found item report registered successfully.',
      reportId: report.id,
      timestamp: report.createdAt,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all found reports with search and filter
 */
exports.getFoundReports = async (req, res, next) => {
  try {
    const { category, location, search, status, limit = 50, page = 1 } = req.query;

    const where = {};
    if (category && category !== 'ALL') where.category = category.toUpperCase();
    if (status && status !== 'ALL') where.status = status.toUpperCase();
    if (location) where.foundLocation = { contains: location };
    if (search) {
      where.OR = [
        { itemName: { contains: search } },
        { description: { contains: search } },
        { foundLocation: { contains: search } },
        { id: { contains: search } }
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.foundReport.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, name: true, email: true, organization: true }
          },
          _count: {
            select: { claims: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }),
      prisma.foundReport.count({ where })
    ]);

    return res.json({
      success: true,
      reports,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single found report details with associated claims
 */
exports.getFoundReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.foundReport.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, phone: true, organization: true }
        },
        claims: {
          include: {
            claimant: { select: { id: true, name: true, email: true } },
            verifier: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Found report not found.' });
    }

    return res.json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};
