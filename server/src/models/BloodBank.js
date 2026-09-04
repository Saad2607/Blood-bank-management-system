const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide blood bank name'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide blood bank official license number'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide official email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide official contact phone'],
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
    storageCapacityUnits: {
      type: Number,
      default: 1500,
    },
    operatingHours: {
      type: String,
      default: '24/7 (Emergency Blood Issue Active)',
    },
    emergencyContact: {
      type: String,
      default: '1800-BLOOD-HELP',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    componentSeparationAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodBank', bloodBankSchema);
