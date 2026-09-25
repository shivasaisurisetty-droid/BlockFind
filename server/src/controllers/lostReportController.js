const prisma = require('../config/db');
const { generateLostReportId } = require('../utils/idGenerator');
const auditService = require('../services/auditService');
const notificationService = require('../services/notificationService');
const blockchainService = require('../services/blockchainService');
const { getStorageService } = require('../services/storageService');

const storageService = getStorageService();

/**
 * Report an item or registered asset as LOST
 */
exports.createLostReport = async (req, res, next) => {
  try {
    const {
      assetId,
      itemName,
      category,
      description,
      lastKnownLocation,
      dateLost,
      approximateTime,
      additionalInfo
    } = req.body;

    if (!itemName || !category || !description || !lastKnownLocation || !dateLost) {
      return res.status(400).json({
        success: false,
        message: 'Item name, category, description, last known location, and date lost are required.'
      });
    }

    const reportId = generateLostReportId();
    let imageUrl = null;

    if (req.file) {
      imageUrl = await storageService.uploadFile(req.file);
    }

    // If linked to existing asset, update asset status to LOST
    let validAssetId = null;
    if (assetId) {
      const asset = await prisma.asset.findUnique({ where: { id: assetId } });
      if (asset) {
        validAssetId = asset.id;
        await prisma.asset.update({
          where: { id: asset.id },
          data: { status: 'LOST' }
        });
      }
    }

    const report = await prisma.lostReport.create({
      data: {
        id: reportId,
        assetId: validAssetId,
        itemName: itemName.trim(),
        category: category.toUpperCase().trim(),
        description: description.trim(),
        lastKnownLocation: lastKnownLocation.trim(),
        dateLost: dateLost.trim(),
        approximateTime: approximateTime || null,
        additionalInfo: additionalInfo ? additionalInfo.trim() : null,
        imageUrl,
        reporterId: req.user.id,
        status: 'ACTIVE'
      }
    });

    // Record on blockchain
    await blockchainService.recordStatusChange({
      assetId: validAssetId,
      status: 'LOST',
      actorId: req.user.id,
      details: `Lost report ${report.id} registered for ${report.itemName} at ${report.lastKnownLocation}`
    });

    // Audit Log
    await auditService.log({
      eventType: 'ITEM_REPORTED_LOST',
      userId: req.user.id,
      assetId: validAssetId,
      details: `Lost item reported: ${report.itemName} (${report.id}) at ${report.lastKnownLocation}`,
      ipAddress: req.ip
    });

    // User Notification
    await notificationService.notify({
      userId: req.user.id,
      title: 'Lost Asset Report Registered',
      message: `Your lost report for "${report.itemName}" (${report.id}) has been recorded. We will alert you if matching items are found.`,
      type: 'SUCCESS',
      linkUrl: `/lost-reports/${report.id}`
    });

    // Notify Security/Verifiers
    await notificationService.notifyRole({
      role: 'VERIFIER',
      title: 'New Lost Item Report',
      message: `A new lost report (${report.id}) for "${report.itemName}" was reported at ${report.lastKnownLocation}.`,
      type: 'INFO',
      linkUrl: `/lost-reports`
    });

    return res.status(201).json({
      success: true,
      message: 'Lost Asset Report Successfully Registered',
      reportId: report.id,
      assetId: validAssetId,
      timestamp: report.createdAt,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all lost reports with filter and search
 */
exports.getLostReports = async (req, res, next) => {
  try {
    const { category, location, search, status, limit = 50, page = 1 } = req.query;

    const where = {};
    if (category && category !== 'ALL') where.category = category.toUpperCase();
    if (status && status !== 'ALL') where.status = status.toUpperCase();
    if (location) where.lastKnownLocation = { contains: location };
    if (search) {
      where.OR = [
        { itemName: { contains: search } },
        { description: { contains: search } },
        { lastKnownLocation: { contains: search } },
        { id: { contains: search } }
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.lostReport.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, name: true, email: true, organization: true }
          },
          asset: {
            select: { id: true, name: true, serialNumber: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }),
      prisma.lostReport.count({ where })
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
 * Get single lost report details
 */
exports.getLostReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.lostReport.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, phone: true, organization: true }
        },
        asset: {
          include: {
            ownershipHistory: true,
            blockchainTxs: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Lost report not found.' });
    }

    return res.json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};
