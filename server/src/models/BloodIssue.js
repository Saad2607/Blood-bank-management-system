const mongoose = require('mongoose');

const bloodIssueSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
      unique: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank',
      required: true,
    },
    issuedUnits: [
      {
        unitId: { type: String, required: true },
        bloodInventory: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodInventory', required: true },
        bloodGroup: { type: String, required: true },
        componentType: { type: String, required: true },
        expiryDate: { type: Date, required: true },
      },
    ],
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coldChainVerification: {
      temperatureAtDispatchCelsius: { type: Number, default: 4.0 },
      icePackIntact: { type: Boolean, default: true },
      transportBoxSealed: { type: Boolean, default: true },
    },
    recipientDetails: {
      staffName: { type: String, default: 'Hospital Dispatch Receiver' },
      staffDesignation: { type: String, default: 'Nurse / Blood Bank Liaison' },
      contactPhone: { type: String, default: '9876543210' },
    },
    dispatchDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Dispatched', 'Delivered', 'Acknowledged'],
      default: 'Dispatched',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodIssue', bloodIssueSchema);
