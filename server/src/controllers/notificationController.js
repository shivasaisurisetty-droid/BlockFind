const notificationService = require('../services/notificationService');

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    return res.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(id, req.user.id);
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};
