const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recipientRole: {
      type: String,
      enum: ['superadmin', 'bloodbank', 'hospital', 'donor', 'all'],
      required: true,
    },
    recipientBloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank',
      default: null,
    },
    recipientHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'URGENT_REQUEST',
        'LOW_STOCK',
        'EXPIRING_UNIT',
        'APPOINTMENT_UPDATE',
        'REQUEST_STATUS_UPDATE',
        'DISCARD_ALERT',
        'SYSTEM',
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    link: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientUser: 1, isRead: 1 });
notificationSchema.index({ recipientRole: 1, recipientBloodBank: 1 });
notificationSchema.index({ recipientRole: 1, recipientHospital: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
