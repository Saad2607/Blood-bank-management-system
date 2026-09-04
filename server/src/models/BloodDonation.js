const mongoose = require('mongoose');

const bloodDonationSchema = new mongoose.Schema(
  {
    donationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank',
      required: true,
    },
    donationDate: {
      type: Date,
      default: Date.now,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    donationType: {
      type: String,
      enum: ['Whole Blood', 'Platelet Apheresis', 'Plasma Apheresis'],
      default: 'Whole Blood',
    },
    volumeMl: {
      type: Number,
      default: 450,
    },
    screeningVitals: {
      systolicBP: { type: Number, default: 120 },
      diastolicBP: { type: Number, default: 80 },
      pulseRate: { type: Number, default: 72 },
      hemoglobinGdl: { type: Number, default: 13.5 },
      weightKg: { type: Number, default: 65 },
      tempCelsius: { type: Number, default: 36.8 },
    },
    labTesting: {
      hiv: { type: String, enum: ['Negative', 'Positive'], default: 'Negative' },
      hbv: { type: String, enum: ['Negative', 'Positive'], default: 'Negative' },
      hcv: { type: String, enum: ['Negative', 'Positive'], default: 'Negative' },
      syphilis: { type: String, enum: ['Negative', 'Positive'], default: 'Negative' },
      malaria: { type: String, enum: ['Negative', 'Positive'], default: 'Negative' },
      isPassed: { type: Boolean, default: true },
      testedAt: { type: Date, default: Date.now },
      testedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    processedUnits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodInventory',
      },
    ],
    status: {
      type: String,
      enum: ['Screening', 'Collected', 'Tested', 'Processed', 'Discarded'],
      default: 'Processed',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodDonation', bloodDonationSchema);
