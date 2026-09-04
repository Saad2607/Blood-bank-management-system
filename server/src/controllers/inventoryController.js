const BloodInventory = require('../models/BloodInventory');
const BloodBank = require('../models/BloodBank');
const AuditLog = require('../models/AuditLog');
const {
  calculateExpiryDate,
  generateId,
  STORAGE_CONDITIONS,
} = require('../services/compatibilityService');

// @desc    Get paginated blood inventory units
// @route   GET /api/v1/inventory
// @access  Private (BloodBank, SuperAdmin, Hospital read-only)
const getInventory = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      componentType,
      status = 'available',
      bloodBankId,
      unitId,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Filter by bank: BloodBank staff sees their own; SuperAdmin can specify or see all
    if (req.user.role === 'bloodbank') {
      query.bloodBank = req.user.bloodBank?._id || req.user.bloodBank;
    } else if (bloodBankId) {
      query.bloodBank = bloodBankId;
    }

    if (bloodGroup && bloodGroup !== 'All') {
      query.bloodGroup = bloodGroup;
    }

    if (componentType && componentType !== 'All') {
      query.componentType = componentType;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (unitId) {
      query.unitId = { $regex: unitId.trim(), $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await BloodInventory.countDocuments(query);

    const units = await BloodInventory.find(query)
      .populate('bloodBank', 'name city licenseNumber phone')
      .sort({ expiryDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: units.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: units,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated inventory summary matrix and critical metrics
// @route   GET /api/v1/inventory/summary
// @access  Private
const getInventorySummary = async (req, res, next) => {
  try {
    const query = { status: 'available' };

    if (req.user.role === 'bloodbank') {
      query.bloodBank = req.user.bloodBank?._id || req.user.bloodBank;
    } else if (req.query.bloodBankId) {
      query.bloodBank = req.query.bloodBankId;
    }

    // Units expiring within the next 7 days
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const expiringQuery = {
      ...query,
      expiryDate: { $lte: sevenDaysLater, $gte: new Date() },
    };

    const expiringUnits = await BloodInventory.find(expiringQuery)
      .populate('bloodBank', 'name city')
      .sort({ expiryDate: 1 })
      .limit(10);

    // Grouping by bloodGroup and componentType
    const matrix = await BloodInventory.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            bloodGroup: '$bloodGroup',
            componentType: '$componentType',
          },
          count: { $sum: 1 },
          totalVolume: { $sum: '$volumeMl' },
        },
      },
    ]);

    // Grouping totals by bloodGroup alone
    const bloodGroupTotals = await BloodInventory.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 },
        },
      },
    ]);

    // Grouping totals by component
    const componentTotals = await BloodInventory.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$componentType',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalAvailableUnits = await BloodInventory.countDocuments(query);
    const totalReservedUnits = await BloodInventory.countDocuments({
      ...query,
      status: 'reserved',
    });

    res.status(200).json({
      success: true,
      summary: {
        totalAvailableUnits,
        totalReservedUnits,
        expiringCount: expiringUnits.length,
        expiringUnits,
        matrix,
        bloodGroupTotals,
        componentTotals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a single blood unit to inventory
// @route   POST /api/v1/inventory/units
// @access  Private (BloodBank, SuperAdmin)
const addBloodUnit = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      componentType,
      volumeMl = 450,
      collectionDate = new Date(),
      rack,
      shelf,
      testStatus = 'screened_passed',
    } = req.body;

    if (!bloodGroup || !componentType) {
      return res.status(400).json({
        success: false,
        message: 'Blood group and component type are required.',
      });
    }

    const bloodBankId =
      req.user.role === 'bloodbank'
        ? req.user.bloodBank?._id || req.user.bloodBank
        : req.body.bloodBankId;

    if (!bloodBankId) {
      return res.status(400).json({
        success: false,
        message: 'Associated blood bank ID is required.',
      });
    }

    const unitId = generateId('PPU');
    const expiryDate = calculateExpiryDate(collectionDate, componentType);
    const storageInfo = STORAGE_CONDITIONS[componentType] || {
      rackPrefix: 'RACK',
      temp: '2°C to 6°C',
    };

    const unit = await BloodInventory.create({
      unitId,
      bloodBank: bloodBankId,
      bloodGroup,
      componentType,
      volumeMl,
      collectionDate,
      expiryDate,
      storageLocation: {
        rack: rack || `${storageInfo.rackPrefix}-01`,
        shelf: shelf || 'Shelf-1',
        temperatureRange: storageInfo.temp,
      },
      status: testStatus === 'screened_passed' ? 'available' : 'quarantine',
      testStatus,
    });

    // Audit Log
    await AuditLog.create({
      action: 'BLOOD_UNIT_ADDED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'BloodInventory',
      entityId: unit.unitId,
      details: {
        unitId: unit.unitId,
        bloodGroup,
        componentType,
        expiryDate,
      },
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: `Blood unit ${unit.unitId} successfully added to inventory.`,
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blood unit status / discard unit
// @route   PUT /api/v1/inventory/units/:id
// @access  Private (BloodBank, SuperAdmin)
const updateBloodUnit = async (req, res, next) => {
  try {
    const { status, rack, shelf, testStatus } = req.body;

    const unit = await BloodInventory.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Blood unit not found' });
    }

    // Permission check
    if (
      req.user.role === 'bloodbank' &&
      unit.bloodBank.toString() !== (req.user.bloodBank?._id || req.user.bloodBank).toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update blood units belonging to your blood bank.',
      });
    }

    if (status) unit.status = status;
    if (testStatus) unit.testStatus = testStatus;
    if (rack) unit.storageLocation.rack = rack;
    if (shelf) unit.storageLocation.shelf = shelf;

    await unit.save();

    await AuditLog.create({
      action: 'BLOOD_UNIT_UPDATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'BloodInventory',
      entityId: unit.unitId,
      details: { status: unit.status, testStatus: unit.testStatus },
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Unit ${unit.unitId} updated successfully`,
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getInventorySummary,
  addBloodUnit,
  updateBloodUnit,
};
