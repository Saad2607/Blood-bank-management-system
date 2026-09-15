const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientAge: {
      type: Number,
      required: [true, 'Patient age is required'],
    },
    patientGender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    hospitalFileNumber: {
      type: String,
      required: [true, 'Hospital inpatient/case file number is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Patient blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    componentType: {
      type: String,
      required: [true, 'Blood component is required'],
      enum: [
        'Whole Blood',
        'Packed Red Blood Cells (PRBC)',
        'Fresh Frozen Plasma (FFP)',
        'Platelet Concentrate',
        'Cryoprecipitate',
      ],
    },
    unitsRequested: {
      type: Number,
      required: [true, 'Units requested is required'],
      min: 1,
    },
    urgency: {
      type: String,
      enum: ['Routine', 'Urgent', 'Emergency'],
      default: 'Routine',
      index: true,
    },
    clinicalDiagnosis: {
      type: String,
      required: [true, 'Clinical diagnosis and indication for transfusion is required'],
      trim: true,
    },
    requiredByDate: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'issued', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    allocatedUnits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodInventory',
      },
    ],
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
