const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Please select a blood group'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      index: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    dateOfBirth: {
      type: Date,
    },
    weightKg: {
      type: Number,
      min: [45, 'Weight must be at least 45 kg to donate blood'],
      default: 60,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    nextEligibleDate: {
      type: Date,
      default: Date.now,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    isAvailableToDonate: {
      type: Boolean,
      default: true,
    },
    chronicIllness: {
      type: String,
      default: 'None',
    },
    allergies: {
      type: String,
      default: 'None',
    },
    tattooInLast6Months: {
      type: Boolean,
      default: false,
    },
    emergencyContactName: {
      type: String,
      default: '',
    },
    emergencyContactPhone: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if donor is medically eligible based on date
donorSchema.methods.isEligible = function () {
  if (!this.nextEligibleDate) return true;
  return new Date() >= new Date(this.nextEligibleDate);
};

module.exports = mongoose.model('Donor', donorSchema);
