const prisma = require('../config/db');
const { generateAssetId } = require('../utils/idGenerator');
const blockchainService = require('../services/blockchainService');
const auditService = require('../services/auditService');
const { getStorageService } = require('../services/storageService');

const storageService = getStorageService();

/**
 * Register a new physical asset
 */
exports.createAsset = async (req, res, next) => {
  try {
    const { name, category, serialNumber, description } = req.body;

    if (!name || !category || !description) {
      return res.status(400).json({ success: false, message: 'Asset name, category, and description are required.' });
    }

    const assetId = generateAssetId(category);
    let primaryImageUrl = null;

    if (req.file) {
      primaryImageUrl = await storageService.uploadFile(req.file);
    }

    // 1. Create in PostgreSQL / SQLite Database
    const asset = await prisma.asset.create({
      data: {
        id: assetId,
        name: name.trim(),
        category: category.toUpperCase().trim(),
        serialNumber: serialNumber ? serialNumber.trim() : null,
        description: description.trim(),
        status: 'REGISTERED',
        currentOwnerId: req.user.id,
        primaryImageUrl
      }
    });

    // 2. Register on Blockchain ledger
    const bcResult = await blockchainService.registerAsset({
      assetId: asset.id,
      ownerId: req.user.id,
      ownerEmail: req.user.email,
      assetName: asset.name,
      category: asset.category,
      serialNumber: asset.serialNumber
    });

    // 3. Update asset with txHash
    const updatedAsset = await prisma.asset.update({
      where: { id: asset.id },
      data: { blockchainTxHash: bcResult.txHash }
    });

    // 4. Record Initial Ownership History
    await prisma.ownershipHistory.create({
      data: {
        assetId: asset.id,
        newOwnerId: req.user.id,
        transferType: 'INITIAL_REGISTRATION',
        transferReason: 'Original Asset Registration',
        blockchainTxHash: bcResult.txHash
      }
    });

    // 5. Create Audit Log
    await auditService.log({
      eventType: 'ASSET_REGISTERED',
      userId: req.user.id,
      assetId: asset.id,
      details: `Asset registered: ${asset.name} (${asset.id}) by ${req.user.name}`,
      ipAddress: req.ip,
      blockchainTxHash: bcResult.txHash
    });

    return res.status(201).json({
      success: true,
      message: 'Asset successfully registered and recorded on the blockchain.',
      asset: updatedAsset,
      blockchain: {
        networkName: bcResult.networkName,
        txHash: bcResult.txHash,
        blockNumber: bcResult.blockNumber,
        status: 'VERIFIED'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all assets (with search, category, status filtering)
 */
exports.getAssets = async (req, res, next) => {
  try {
    const { search, category, status, limit = 50, page = 1 } = req.query;

    const where = {};
    if (category && category !== 'ALL') where.category = category.toUpperCase();
    if (status && status !== 'ALL') where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { id: { contains: search } },
        { serialNumber: { contains: search } }
      ];
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          currentOwner: {
            select: { id: true, name: true, email: true, organization: true }
          },
          _count: {
            select: { claims: true, ownershipHistory: true }
          }
        },
        orderBy: { registeredAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }),
      prisma.asset.count({ where })
    ]);

    return res.json({
      success: true,
      assets,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get assets registered by currently logged in user
 */
exports.getMyAssets = async (req, res, next) => {
  try {
    const assets = await prisma.asset.findMany({
      where: { currentOwnerId: req.user.id },
      include: {
        _count: {
          select: { claims: true, lostReports: true }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    return res.json({
      success: true,
      assets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single asset details with complete blockchain & ownership trail
 */
exports.getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        currentOwner: {
          select: { id: true, name: true, email: true, phone: true, organization: true }
        },
        ownershipHistory: {
          include: {
            previousOwner: { select: { id: true, name: true, email: true } },
            newOwner: { select: { id: true, name: true, email: true } }
          },
          orderBy: { timestamp: 'desc' }
        },
        blockchainTxs: {
          orderBy: { blockTimestamp: 'desc' }
        },
        lostReports: {
          orderBy: { createdAt: 'desc' }
        },
        claims: {
          include: {
            claimant: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    return res.json({
      success: true,
      asset
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update asset details
 */
exports.updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, serialNumber } = req.body;

    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Asset not found.' });
    }

    // Only owner or admin can update
    if (existing.currentOwnerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this asset.' });
    }

    const data = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (status) data.status = status.toUpperCase();
    if (serialNumber !== undefined) data.serialNumber = serialNumber;

    if (req.file) {
      data.primaryImageUrl = await storageService.uploadFile(req.file);
    }

    const updated = await prisma.asset.update({
      where: { id },
      data
    });

    return res.json({
      success: true,
      message: 'Asset updated successfully.',
      asset: updated
    });
  } catch (error) {
    next(error);
  }
};
