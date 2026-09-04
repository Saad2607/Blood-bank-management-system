const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
      index: true,
    },
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank',
      required: true,
      index: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true,
      default: '10:00 AM - 11:00 AM',
    },
    status: {
      type: String,
      enum: ['Booked', 'Completed', 'Cancelled', 'No-Show'],
      default: 'Booked',
      index: true,
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

module.exports = mongoose.model('Appointment', appointmentSchema);
