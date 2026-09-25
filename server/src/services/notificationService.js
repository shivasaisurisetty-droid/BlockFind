const prisma = require('../config/db');

class NotificationService {
  /**
   * Send notification to a specific user
   */
  async notify({ userId, title, message, type = 'INFO', linkUrl }) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          linkUrl: linkUrl || null,
          isRead: false
        }
      });
    } catch (error) {
      console.error('[NotificationService Error]:', error.message);
      return null;
    }
  }

  /**
   * Broadcast notification to all users with a specific role (e.g. all VERIFIERS or ADMINS)
   */
  async notifyRole({ role, title, message, type = 'INFO', linkUrl }) {
    try {
      const users = await prisma.user.findMany({
        where: { role },
        select: { id: true }
      });

      const promises = users.map(user =>
        prisma.notification.create({
          data: {
            userId: user.id,
            title,
            message,
            type,
            linkUrl: linkUrl || null,
            isRead: false
          }
        })
      );

      return await Promise.all(promises);
    } catch (error) {
      console.error('[NotificationService notifyRole Error]:', error.message);
      return [];
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30
    });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}

module.exports = new NotificationService();
