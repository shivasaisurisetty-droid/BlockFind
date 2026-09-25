const auditService = require('../services/auditService');

/**
 * Get system audit trail
 */
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { eventType, assetId, userId, limit = 50, page = 1 } = req.query;

    const result = await auditService.getLogs({
      eventType,
      assetId,
      userId,
      limit,
      page
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};
