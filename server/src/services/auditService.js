const prisma = require('../config/db');

/**
 * Audit Logging Service
 * Records tamper-evident chronological system events.
 */
class AuditService {
  /**
   * Log an auditable event
   */
  async log({ eventType, userId, assetId, details, ipAddress = '127.0.0.1', userAgent, blockchainTxHash }) {
    try {
      return await prisma.auditLog.create({
        data: {
          eventType,
          userId: userId || null,
          assetId: assetId || null,
          details: typeof details === 'string' ? details : JSON.stringify(details),
          ipAddress,
          userAgent: userAgent || 'BlockFind Web Client',
          blockchainTxHash: blockchainTxHash || null
        }
      });
    } catch (error) {
      console.error('[AuditService Error]:', error.message);
      // Non-blocking failover so main flow is not broken
      return null;
    }
  }

  /**
   * Fetch audit logs with pagination and filtering
   */
  async getLogs({ eventType, assetId, userId, limit = 50, page = 1 }) {
    const where = {};
    if (eventType) where.eventType = eventType;
    if (assetId) where.assetId = assetId;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          },
          asset: {
            select: { id: true, name: true, category: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }
}

module.exports = new AuditService();
