const User = require('../models/User');
const BloodBank = require('../models/BloodBank');
const Hospital = require('../models/Hospital');
const BloodInventory = require('../models/BloodInventory');
const BloodRequest = require('../models/BloodRequest');
const BloodDonation = require('../models/BloodDonation');
const Appointment = require('../models/Appointment');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');
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

// @desc    Get all hospital requisitions across all facilities
// @route   GET /api/v1/admin/requests
// @access  Private (SuperAdmin)
const getAllRequests = async (req, res, next) => {
  try {
    const { status, urgency, hospitalId, bloodBankId, bloodGroup, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'All') query.status = status;
    if (urgency && urgency !== 'All') query.urgency = urgency;
    if (hospitalId && hospitalId !== 'All') query.hospital = hospitalId;
    if (bloodBankId && bloodBankId !== 'All') query.bloodBank = bloodBankId;
    if (bloodGroup && bloodGroup !== 'All') query.bloodGroup = bloodGroup;
    if (search) {
      query.$or = [
        { requestId: { $regex: search.trim(), $options: 'i' } },
        { patientName: { $regex: search.trim(), $options: 'i' } },
        { hospitalFileNumber: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await BloodRequest.countDocuments(query);

    const requests = await BloodRequest.find(query)
      .populate('hospital', 'name hospitalType city phone emergencyContact')
      .populate('bloodBank', 'name licenseNumber city phone')
      .populate('allocatedUnits', 'unitId bloodGroup componentType expiryDate status storageLocation')
      .populate('requestedBy', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const statusCounts = {
      total: await BloodRequest.countDocuments(),
      pending: await BloodRequest.countDocuments({ status: 'pending' }),
      approved: await BloodRequest.countDocuments({ status: 'approved' }),
      issued: await BloodRequest.countDocuments({ status: 'issued' }),
      delivered: await BloodRequest.countDocuments({ status: 'delivered' }),
      rejected: await BloodRequest.countDocuments({ status: 'rejected' }),
      cancelled: await BloodRequest.countDocuments({ status: 'cancelled' }),
      emergency: await BloodRequest.countDocuments({ urgency: 'Emergency', status: { $in: ['pending', 'approved'] } }),
    };

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      statusCounts,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    SuperAdmin override of requisition status or blood bank assignment
// @route   PUT /api/v1/admin/requests/:id/override
// @access  Private (SuperAdmin)
const overrideRequestStatus = async (req, res, next) => {
  try {
    const { status, bloodBankId, adminNotes } = req.body;
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    const prevStatus = bloodRequest.status;

    if (status) {
      bloodRequest.status = status;

      // If cancelled or rejected by admin, release any reserved units
      if (['cancelled', 'rejected'].includes(status) && bloodRequest.allocatedUnits?.length > 0) {
        await BloodInventory.updateMany(
          { _id: { $in: bloodRequest.allocatedUnits } },
          { status: 'available', reservedForRequest: null }
        );
      }

      // If delivered, update BloodIssue and BloodInventory to transfused
      if (status === 'delivered') {
        const BloodIssue = require('../models/BloodIssue');
        await BloodIssue.findOneAndUpdate(
          { bloodRequest: bloodRequest._id },
          { status: 'Delivered' }
        );
        if (bloodRequest.allocatedUnits?.length > 0) {
          await BloodInventory.updateMany(
            { _id: { $in: bloodRequest.allocatedUnits } },
            { status: 'transfused' }
          );
        }
      }
    }

    if (bloodBankId) {
      bloodRequest.bloodBank = bloodBankId;
    }

    if (adminNotes) {
      bloodRequest.notes = adminNotes;
    }

    await bloodRequest.save();

    await AuditLog.create({
      action: 'ADMIN_REQUEST_OVERRIDE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'BloodRequest',
      entityId: bloodRequest._id.toString(),
      details: {
        requestId: bloodRequest.requestId,
        prevStatus,
        newStatus: bloodRequest.status,
        reassignedBank: bloodBankId || null,
        adminNotes: adminNotes || '',
      },
      ipAddress: req.ip || '127.0.0.1',
    });

    // Notify hospital
    if (bloodRequest.requestedBy) {
      try {
        await Notification.create({
          recipientUser: bloodRequest.requestedBy,
          recipientRole: 'hospital',
          type: 'REQUEST_STATUS_UPDATE',
          title: `Admin Requisition Override: ${bloodRequest.requestId}`,
          message: `Super Admin updated status from '${prevStatus}' to '${bloodRequest.status}'. ${adminNotes ? `Note: ${adminNotes}` : ''}`,
          link: '/hospital/requests',
        });
      } catch (notifErr) {
        console.error('Admin override notification error:', notifErr.message);
      }
    }

    const updated = await BloodRequest.findById(bloodRequest._id)
      .populate('hospital', 'name city')
      .populate('bloodBank', 'name city')
      .populate('allocatedUnits');

    res.status(200).json({
      success: true,
      message: `Requisition ${bloodRequest.requestId} updated successfully by Super Admin`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get master inventory across all certified blood banks
// @route   GET /api/v1/admin/inventory
// @access  Private (SuperAdmin)
const getAllInventory = async (req, res, next) => {
  try {
    const { bloodBankId, bloodGroup, componentType, status, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (bloodBankId && bloodBankId !== 'All') query.bloodBank = bloodBankId;
    if (bloodGroup && bloodGroup !== 'All') query.bloodGroup = bloodGroup;
    if (componentType && componentType !== 'All') query.componentType = componentType;
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { unitId: { $regex: search.trim(), $options: 'i' } },
        { 'storageLocation.rack': { $regex: search.trim(), $options: 'i' } },
        { 'storageLocation.shelf': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await BloodInventory.countDocuments(query);

    const units = await BloodInventory.find(query)
      .populate('bloodBank', 'name city licenseNumber phone')
      .sort({ expiryDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    const now = new Date();
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const inventoryStats = {
      totalUnits: await BloodInventory.countDocuments(),
      available: await BloodInventory.countDocuments({ status: 'available', expiryDate: { $gt: now } }),
      reserved: await BloodInventory.countDocuments({ status: 'reserved' }),
      transfused: await BloodInventory.countDocuments({ status: 'transfused' }),
      discarded: await BloodInventory.countDocuments({ status: 'discarded' }),
      quarantine: await BloodInventory.countDocuments({ testStatus: 'quarantine' }),
      expiringSoon: await BloodInventory.countDocuments({
        status: 'available',
        expiryDate: { $gt: now, $lte: in7Days },
      }),
    };

    res.status(200).json({
      success: true,
      count: units.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      stats: inventoryStats,
      data: units,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    SuperAdmin intervention on blood inventory unit
// @route   PUT /api/v1/admin/inventory/units/:id/status
// @access  Private (SuperAdmin)
const overrideUnitStatus = async (req, res, next) => {
  try {
    const { status, testStatus, discardReason, discardNotes } = req.body;
    const unit = await BloodInventory.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({ success: false, message: 'Blood unit not found' });
    }

    if (status) unit.status = status;
    if (testStatus) unit.testStatus = testStatus;
    if (discardReason) {
      unit.status = 'discarded';
      unit.discardReason = discardReason;
      unit.discardDate = new Date();
      unit.discardNotes = discardNotes || 'Super Admin compliance action';
      unit.discardedBy = req.user._id;
    }

    await unit.save();

    await AuditLog.create({
      action: 'ADMIN_UNIT_OVERRIDE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'BloodInventory',
      entityId: unit._id.toString(),
      details: { unitId: unit.unitId, newStatus: unit.status, discardReason: discardReason || null },
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Unit ${unit.unitId} updated successfully by Super Admin`,
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get master donor registry, appointments & donation collections
// @route   GET /api/v1/admin/donors-overview
// @access  Private (SuperAdmin)
const getDonorsAndCollections = async (req, res, next) => {
  try {
    const { bloodGroup, bloodBankId, status } = req.query;

    const donorQuery = {};
    if (bloodGroup && bloodGroup !== 'All') donorQuery.bloodGroup = bloodGroup;

    const donors = await Donor.find(donorQuery)
      .populate('user', 'name email phone city address isActive')
      .sort({ totalDonations: -1, createdAt: -1 });

    const appointmentQuery = {};
    if (bloodBankId && bloodBankId !== 'All') appointmentQuery.bloodBank = bloodBankId;
    if (status && status !== 'All') appointmentQuery.status = status;

    const appointments = await Appointment.find(appointmentQuery)
      .populate({
        path: 'donor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('bloodBank', 'name city licenseNumber')
      .sort({ appointmentDate: -1 })
      .limit(100);

    const donationQuery = {};
    if (bloodBankId && bloodBankId !== 'All') donationQuery.bloodBank = bloodBankId;
    if (bloodGroup && bloodGroup !== 'All') donationQuery.bloodGroup = bloodGroup;

    const donations = await BloodDonation.find(donationQuery)
      .populate({
        path: 'donor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('bloodBank', 'name city')
      .populate('processedUnits', 'unitId componentType volumeMl status')
      .sort({ donationDate: -1 })
      .limit(100);

    const now = new Date();
    const donorStats = {
      totalDonors: await Donor.countDocuments(),
      eligibleToday: await Donor.countDocuments({ nextEligibleDate: { $lte: now } }),
      coolingOff: await Donor.countDocuments({ nextEligibleDate: { $gt: now } }),
      totalAppointments: await Appointment.countDocuments(),
      pendingAppointments: await Appointment.countDocuments({ status: 'Booked' }),
      completedDonations: await BloodDonation.countDocuments(),
    };

    res.status(200).json({
      success: true,
      stats: donorStats,
      donors,
      appointments,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    SuperAdmin override of appointment status
// @route   PUT /api/v1/admin/appointments/:id/status
// @access  Private (SuperAdmin)
const overrideAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'donor', populate: { path: 'user', select: 'name email' } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    await AuditLog.create({
      action: 'ADMIN_APPOINTMENT_OVERRIDE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'Appointment',
      entityId: appointment._id.toString(),
      details: { newStatus: appointment.status },
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Appointment updated to '${appointment.status}' by Super Admin`,
      data: appointment,
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
  getAllRequests,
  overrideRequestStatus,
  getAllInventory,
  overrideUnitStatus,
  getDonorsAndCollections,
  overrideAppointmentStatus,
};
