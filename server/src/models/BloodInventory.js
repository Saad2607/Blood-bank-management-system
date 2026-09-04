const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema(
  {
    unitId: {
      type: String,
      required: [true, 'Unit identifier is required'],
      unique: true,
      index: true,
      trim: true,
    },
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank',
      required: [true, 'Associated blood bank is required'],
      index: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      index: true,
    },
    componentType: {
      type: String,
      required: [true, 'Blood component type is required'],
      enum: [
        'Whole Blood',
        'Packed Red Blood Cells (PRBC)',
        'Fresh Frozen Plasma (FFP)',
        'Platelet Concentrate',
        'Cryoprecipitate',
      ],
      index: true,
    },
    volumeMl: {
      type: Number,
      default: 450,
    },
    collectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    storageLocation: {
      rack: { type: String, default: 'Rack-A1' },
      shelf: { type: String, default: 'Shelf-1' },
      temperatureRange: { type: String, default: '2°C to 6°C' },
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'issued', 'transfused', 'discarded', 'expired'],
      default: 'available',
      index: true,
    },
    testStatus: {
      type: String,
      enum: ['screened_passed', 'quarantine', 'reactive_discarded'],
      default: 'screened_passed',
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
    },
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodDonation',
    },
    reservedForRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if expired
bloodInventorySchema.virtual('isExpired').get(function () {
  return new Date() > new Date(this.expiryDate);
});

module.exports = mongoose.model('BloodInventory', bloodInventorySchema);
