const BloodInventory = require('../models/BloodInventory');
const BloodBank = require('../models/BloodBank');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const { RBC_COMPATIBILITY, PLASMA_COMPATIBILITY } = require('../services/compatibilityService');

// @desc    Live public blood availability search
// @route   GET /api/v1/public/availability
// @access  Public
const searchBloodAvailability = async (req, res, next) => {
  try {
    const { bloodGroup, componentType = 'Whole Blood', city } = req.query;

    const matchQuery = {
      status: 'available',
      testStatus: 'screened_passed',
      expiryDate: { $gt: new Date() },
    };

    if (componentType && componentType !== 'All') {
      matchQuery.componentType = componentType;
    }

    // Determine compatible donor blood groups
    let compatibleGroups = [];
    if (bloodGroup && bloodGroup !== 'All') {
      if (componentType === 'Fresh Frozen Plasma (FFP)' || componentType === 'Cryoprecipitate') {
        compatibleGroups = PLASMA_COMPATIBILITY[bloodGroup] || [bloodGroup];
      } else {
        compatibleGroups = RBC_COMPATIBILITY[bloodGroup] || [bloodGroup];
      }
      matchQuery.bloodGroup = { $in: compatibleGroups };
    }

    // Aggregation pipeline to join BloodBank details
    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'bloodbanks',
          localField: 'bloodBank',
          foreignField: '_id',
          as: 'bankInfo',
        },
      },
      { $unwind: '$bankInfo' },
    ];

    if (city && city !== 'All') {
      pipeline.push({
        $match: { 'bankInfo.city': { $regex: city.trim(), $options: 'i' } },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            bankId: '$bankInfo._id',
            bankName: '$bankInfo.name',
            city: '$bankInfo.city',
            street: '$bankInfo.street',
            phone: '$bankInfo.phone',
            emergencyContact: '$bankInfo.emergencyContact',
            bloodGroup: '$bloodGroup',
            componentType: '$componentType',
          },
          availableUnitsCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          bankId: '$_id.bankId',
          bankName: '$_id.bankName',
          city: '$_id.city',
          street: '$_id.street',
          phone: '$_id.phone',
          emergencyContact: '$_id.emergencyContact',
          bloodGroup: '$_id.bloodGroup',
          componentType: '$_id.componentType',
          availableUnitsCount: 1,
          isExactMatch: bloodGroup ? { $eq: ['$_id.bloodGroup', bloodGroup] } : true,
        },
      },
      { $sort: { isExactMatch: -1, availableUnitsCount: -1 } }
    );

    const results = await BloodInventory.aggregate(pipeline);

    res.status(200).json({
      success: true,
      query: { bloodGroup, componentType, city },
      compatibleGroups,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get verified blood banks directory
// @route   GET /api/v1/public/blood-banks
// @access  Public
const getVerifiedBloodBanks = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { isVerified: true };

    if (city && city !== 'All') {
      query.city = { $regex: city.trim(), $options: 'i' };
    }

    if (search) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const bloodBanks = await BloodBank.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: bloodBanks.length,
      data: bloodBanks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get partner hospitals directory
// @route   GET /api/v1/public/hospitals
// @access  Public
const getVerifiedHospitals = async (req, res, next) => {
  try {
    const { city } = req.query;
    const query = { isVerified: true };

    if (city && city !== 'All') {
      query.city = { $regex: city.trim(), $options: 'i' };
    }

    const hospitals = await Hospital.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall public impact statistics
// @route   GET /api/v1/public/stats
// @access  Public
const getPublicStats = async (req, res, next) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const totalBloodBanks = await BloodBank.countDocuments();
    const totalHospitals = await Hospital.countDocuments();
    const totalAvailableUnits = await BloodInventory.countDocuments({
      status: 'available',
      testStatus: 'screened_passed',
      expiryDate: { $gt: new Date() },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalDonors,
        totalBloodBanks,
        totalHospitals,
        totalAvailableUnits,
        estimatedLivesSaved: totalAvailableUnits * 3, // Each unit of separated blood can save up to 3 lives
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchBloodAvailability,
  getVerifiedBloodBanks,
  getVerifiedHospitals,
  getPublicStats,
};
