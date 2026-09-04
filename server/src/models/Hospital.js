const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hospital name'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Please provide medical registration/accreditation number'],
      unique: true,
      trim: true,
    },
    hospitalType: {
      type: String,
      enum: ['Government', 'Private', 'Trust', 'Clinic'],
      default: 'Private',
    },
    email: {
      type: String,
      required: [true, 'Please provide official email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide hospital contact phone'],
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    emergencyContact: {
      type: String,
      default: '108 / 102 Hospital Emergency Desk',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
