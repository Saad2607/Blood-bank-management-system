const Notification = require('../models/Notification');

// @desc    Get current user / facility notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const filter = {
      $or: [
        { recipientUser: req.user._id },
        { recipientRole: req.user.role },
        { recipientRole: 'all' },
      ],
    };

    if (req.user.bloodBank) {
      filter.$or.push({ recipientBloodBank: req.user.bloodBank });
    }
    if (req.user.hospital) {
      filter.$or.push({ recipientHospital: req.user.hospital });
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read for current user/facility
// @route   PUT /api/v1/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const filter = {
      $or: [
        { recipientUser: req.user._id },
        { recipientRole: req.user.role },
      ],
    };

    if (req.user.bloodBank) {
      filter.$or.push({ recipientBloodBank: req.user.bloodBank });
    }
    if (req.user.hospital) {
      filter.$or.push({ recipientHospital: req.user.hospital });
    }

    await Notification.updateMany(filter, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err) {
    next(err);
  }
};
