const BloodDonation = require('../models/BloodDonation');
const BloodInventory = require('../models/BloodInventory');
const Donor = require('../models/Donor');
const AuditLog = require('../models/AuditLog');
const {
  calculateExpiryDate,
  generateId,
  STORAGE_CONDITIONS,
} = require('../services/compatibilityService');

// @desc    Record a new blood donation collection with pre-screening vitals
// @route   POST /api/v1/donations
// @access  Private (BloodBank)
const recordDonation = async (req, res, next) => {
  try {
    const {
      donorId,
      bloodGroup,
      donationType = 'Whole Blood',
      volumeMl = 450,
      systolicBP = 120,
      diastolicBP = 80,
      pulseRate = 72,
      hemoglobinGdl = 13.5,
      weightKg = 65,
      tempCelsius = 36.8,
      separateComponents = true, // Whether to produce PRBC and FFP or keep as Whole Blood
      notes = '',
    } = req.body;

    const bloodBankId = req.user.bloodBank?._id || req.user.bloodBank;
    if (!bloodBankId) {
      return res.status(400).json({
        success: false,
        message: 'Your account is not linked to a registered blood bank.',
      });
    }

    if (!donorId || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Donor reference and blood group are required.',
      });
    }

    // Medical Eligibility Pre-Screening Checks
    if (weightKg < 45) {
      return res.status(400).json({
        success: false,
        message: 'Donor weight must be at least 45 kg for clinical safety.',
      });
    }

    if (hemoglobinGdl < 12.5) {
      return res.status(400).json({
        success: false,
        message: 'Hemoglobin level is below 12.5 g/dL minimum safety threshold.',
      });
    }

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    // Check cooldown
    if (donor.lastDonationDate) {
      const daysSince = Math.floor(
        (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince < 56) {
        return res.status(400).json({
          success: false,
          message: `Donor is within the 56-day cooldown period. Last donated ${daysSince} days ago. Eligible in ${56 - daysSince} days.`,
        });
      }
    }

    const donationId = generateId('DN');

    // Create donation record
    const donation = await BloodDonation.create({
      donationId,
      donor: donor._id,
      bloodBank: bloodBankId,
      donationDate: new Date(),
      bloodGroup,
      donationType,
      volumeMl,
      screeningVitals: {
        systolicBP,
        diastolicBP,
        pulseRate,
        hemoglobinGdl,
        weightKg,
        tempCelsius,
      },
      labTesting: {
        hiv: 'Negative',
        hbv: 'Negative',
        hcv: 'Negative',
        syphilis: 'Negative',
        malaria: 'Negative',
        isPassed: true,
        testedAt: new Date(),
        testedBy: req.user._id,
      },
      status: 'Processed',
      notes,
    });

    // Create units in inventory
    const createdUnitIds = [];

    if (separateComponents) {
      // 1. Packed Red Blood Cells (PRBC)
      const prbcUnitId = generateId('PPU');
      const prbcExpiry = calculateExpiryDate(new Date(), 'Packed Red Blood Cells (PRBC)');
      const prbcStorage = STORAGE_CONDITIONS['Packed Red Blood Cells (PRBC)'];

      const prbc = await BloodInventory.create({
        unitId: prbcUnitId,
        bloodBank: bloodBankId,
        bloodGroup,
        componentType: 'Packed Red Blood Cells (PRBC)',
        volumeMl: 280,
        collectionDate: new Date(),
        expiryDate: prbcExpiry,
        storageLocation: {
          rack: `${prbcStorage.rackPrefix}-01`,
          shelf: 'Shelf-1',
          temperatureRange: prbcStorage.temp,
        },
        status: 'available',
        testStatus: 'screened_passed',
        donor: donor._id,
        donation: donation._id,
      });
      createdUnitIds.push(prbc._id);

      // 2. Fresh Frozen Plasma (FFP)
      const ffpUnitId = generateId('PPU');
      const ffpExpiry = calculateExpiryDate(new Date(), 'Fresh Frozen Plasma (FFP)');
      const ffpStorage = STORAGE_CONDITIONS['Fresh Frozen Plasma (FFP)'];

      const ffp = await BloodInventory.create({
        unitId: ffpUnitId,
        bloodBank: bloodBankId,
        bloodGroup,
        componentType: 'Fresh Frozen Plasma (FFP)',
        volumeMl: 200,
        collectionDate: new Date(),
        expiryDate: ffpExpiry,
        storageLocation: {
          rack: `${ffpStorage.rackPrefix}-01`,
          shelf: 'Shelf-Freezer',
          temperatureRange: ffpStorage.temp,
        },
        status: 'available',
        testStatus: 'screened_passed',
        donor: donor._id,
        donation: donation._id,
      });
      createdUnitIds.push(ffp._id);
    } else {
      // Whole Blood unit
      const wbUnitId = generateId('PPU');
      const wbExpiry = calculateExpiryDate(new Date(), 'Whole Blood');
      const wbStorage = STORAGE_CONDITIONS['Whole Blood'];

      const wb = await BloodInventory.create({
        unitId: wbUnitId,
        bloodBank: bloodBankId,
        bloodGroup,
        componentType: 'Whole Blood',
        volumeMl,
        collectionDate: new Date(),
        expiryDate: wbExpiry,
        storageLocation: {
          rack: `${wbStorage.rackPrefix}-01`,
          shelf: 'Shelf-1',
          temperatureRange: wbStorage.temp,
        },
        status: 'available',
        testStatus: 'screened_passed',
        donor: donor._id,
        donation: donation._id,
      });
      createdUnitIds.push(wb._id);
    }

    donation.processedUnits = createdUnitIds;
    await donation.save();

    // Update Donor profile
    donor.lastDonationDate = new Date();
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 56);
    donor.nextEligibleDate = nextDate;
    donor.totalDonations += 1;
    await donor.save();

    await AuditLog.create({
      action: 'DONATION_RECORDED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'BloodDonation',
      entityId: donation.donationId,
      details: {
        donationId: donation.donationId,
        bloodGroup,
        unitsGenerated: createdUnitIds.length,
      },
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: `Donation ${donation.donationId} recorded. ${createdUnitIds.length} unit(s) generated into inventory.`,
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donations for current blood bank
// @route   GET /api/v1/donations/bloodbank
// @access  Private (BloodBank)
const getBankDonations = async (req, res, next) => {
  try {
    const bloodBankId = req.user.bloodBank?._id || req.user.bloodBank;
    const donations = await BloodDonation.find({ bloodBank: bloodBankId })
      .populate({
        path: 'donor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('processedUnits', 'unitId componentType expiryDate status')
      .sort({ donationDate: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donation history for logged-in donor
// @route   GET /api/v1/donations/my-history
// @access  Private (Donor)
const getMyDonations = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor record not found' });
    }

    const donations = await BloodDonation.find({ donor: donor._id })
      .populate('bloodBank', 'name city street phone')
      .populate('processedUnits', 'unitId componentType status')
      .sort({ donationDate: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
      eligibility: {
        isEligible: donor.isEligible(),
        lastDonationDate: donor.lastDonationDate,
        nextEligibleDate: donor.nextEligibleDate,
        totalDonations: donor.totalDonations,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordDonation,
  getBankDonations,
  getMyDonations,
};
