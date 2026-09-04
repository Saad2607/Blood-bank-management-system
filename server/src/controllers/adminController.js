const User = require('../models/User');
const BloodBank = require('../models/BloodBank');
const Hospital = require('../models/Hospital');
const BloodInventory = require('../models/BloodInventory');
const BloodRequest = require('../models/BloodRequest');
const BloodDonation = require('../models/BloodDonation');
const AuditLog = require('../models/AuditLog');

// @desc    Get master system dashboard KPIs
// @route   GET /api/v1/admin/stats
// @access  Private (SuperAdmin)
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const donorCount = await User.countDocuments({ role: 'donor' });
    const hospitalStaffCount = await User.countDocuments({ role: 'hospital' });
    const bloodBankStaffCount = await User.countDocuments({ role: 'bloodbank' });

    const totalBloodBanks = await BloodBank.countDocuments();
    const totalHospitals = await Hospital.countDocuments();

    const totalInventoryUnits = await BloodInventory.countDocuments();
    const availableUnits = await BloodInventory.countDocuments({
      status: 'available',
      testStatus: 'screened_passed',
      expiryDate: { $gt: new Date() },
    });

    const totalRequests = await BloodRequest.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await BloodRequest.countDocuments({ status: 'approved' });
    const issuedRequests = await BloodRequest.countDocuments({ status: 'issued' });

    const totalDonations = await BloodDonation.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          donors: donorCount,
          hospitalStaff: hospitalStaffCount,
          bloodBankStaff: bloodBankStaffCount,
        },
        facilities: {
          bloodBanks: totalBloodBanks,
          hospitals: totalHospitals,
        },
        inventory: {
          totalUnits: totalInventoryUnits,
          availableUnits,
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          issued: issuedRequests,
        },
        donations: {
          total: totalDonations,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with pagination and role filter
// @route   GET /api/v1/admin/users
// @access  Private (SuperAdmin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('bloodBank', 'name city')
      .populate('hospital', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/v1/admin/users/:id/toggle-status
// @access  Private (SuperAdmin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'User',
      entityId: user._id.toString(),
      details: { email: user.email, isActive: user.isActive },
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new blood bank facility
// @route   POST /api/v1/admin/blood-banks
// @access  Private (SuperAdmin)
const createBloodBank = async (req, res, next) => {
  try {
    const bloodBank = await BloodBank.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Blood bank registered successfully',
      data: bloodBank,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new hospital facility
// @route   POST /api/v1/admin/hospitals
// @access  Private (SuperAdmin)
const createHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully',
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system audit logs
// @route   GET /api/v1/admin/audit-logs
// @access  Private (SuperAdmin)
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, limit = 50 } = req.query;
    const query = {};
    if (action && action !== 'All') query.action = action;

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  createBloodBank,
  createHospital,
  getAuditLogs,
};
