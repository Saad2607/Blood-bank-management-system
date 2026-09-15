const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory');
const BloodIssue = require('../models/BloodIssue');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { isBloodCompatible, generateId } = require('../services/compatibilityService');

// @desc    Create a new blood request (Hospital Staff)
// @route   POST /api/v1/requests
// @access  Private (Hospital)
const createBloodRequest = async (req, res, next) => {
  try {
    const {
      bloodBankId,
      patientName,
      patientAge,
      patientGender,
      hospitalFileNumber,
      bloodGroup,
      componentType,
      unitsRequested,
      urgency = 'Routine',
      clinicalDiagnosis,
      requiredByDate,
    } = req.body;

    const hospitalId = req.user.hospital?._id || req.user.hospital;
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Your account is not linked to an accredited hospital.',
      });
    }

    if (
      !bloodBankId ||
      !patientName ||
      !patientAge ||
      !patientGender ||
      !hospitalFileNumber ||
      !bloodGroup ||
      !componentType ||
      !unitsRequested ||
      !clinicalDiagnosis
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory clinical request fields.',
      });
    }

    const requestId = generateId('REQ');

    const bloodRequest = await BloodRequest.create({
      requestId,
      hospital: hospitalId,
      bloodBank: bloodBankId,
      patientName,
      patientAge,
      patientGender,
      hospitalFileNumber,
      bloodGroup,
      componentType,
      unitsRequested: Number(unitsRequested),
      urgency,
      clinicalDiagnosis,
      requiredByDate: requiredByDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
      requestedBy: req.user._id,
      status: 'pending',
    });

    await AuditLog.create({
      action: 'BLOOD_REQUEST_CREATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'BloodRequest',
      entityId: bloodRequest.requestId,
      details: {
        requestId,
        bloodGroup,
        componentType,
        unitsRequested,
        urgency,
      },
      ipAddress: req.ip || '127.0.0.1',
    });

    // Create In-App Notification for the receiving Blood Bank
    try {
      await Notification.create({
        recipientRole: 'bloodbank',
        recipientBloodBank: bloodBankId,
        type: urgency === 'Emergency' ? 'URGENT_REQUEST' : 'REQUEST_STATUS_UPDATE',
        title: `${urgency === 'Emergency' ? '🚨 EMERGENCY' : urgency === 'Urgent' ? '⚠️ URGENT' : 'New'} Request: ${unitsRequested}x ${bloodGroup} ${componentType}`,
        message: `Order ${requestId} submitted by hospital. Urgency triage: ${urgency}. Diagnosis: ${clinicalDiagnosis || 'Standard'}.`,
        priority: urgency === 'Emergency' ? 'emergency' : urgency === 'Urgent' ? 'urgent' : 'routine',
        link: '/bloodbank/requests',
      });
    } catch (notifErr) {
      console.error('Notification create error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Blood request ${requestId} created successfully with urgency ${urgency}.`,
      data: bloodRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get requests made by the current hospital
// @route   GET /api/v1/requests/hospital
// @access  Private (Hospital)
const getHospitalRequests = async (req, res, next) => {
  try {
    const hospitalId = req.user.hospital?._id || req.user.hospital;
    const { status, urgency } = req.query;

    const query = { hospital: hospitalId };
    if (status && status !== 'All') query.status = status;
    if (urgency && urgency !== 'All') query.urgency = urgency;

    const requests = await BloodRequest.find(query)
      .populate('bloodBank', 'name city phone email emergencyContact')
      .populate('allocatedUnits', 'unitId bloodGroup componentType expiryDate status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get requests assigned to the current blood bank
// @route   GET /api/v1/requests/bloodbank
// @access  Private (BloodBank)
const getBloodBankRequests = async (req, res, next) => {
  try {
    const bloodBankId = req.user.bloodBank?._id || req.user.bloodBank;
    const { status, urgency } = req.query;

    const query = { bloodBank: bloodBankId };
    if (status && status !== 'All') query.status = status;
    if (urgency && urgency !== 'All') query.urgency = urgency;

    // Sort: Emergency first, then Urgent, then Routine, then by newest
    const requests = await BloodRequest.find(query)
      .populate('hospital', 'name hospitalType city phone emergencyContact')
      .populate('allocatedUnits', 'unitId bloodGroup componentType expiryDate status storageLocation')
      .sort({ createdAt: -1 });

    // In-memory sort to prioritize Emergency / Urgent
    const urgencyWeight = { Emergency: 3, Urgent: 2, Routine: 1 };
    requests.sort((a, b) => {
      const weightA = urgencyWeight[a.urgency] || 1;
      const weightB = urgencyWeight[b.urgency] || 1;
      if (weightB !== weightA) return weightB - weightA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get request by ID with full details
// @route   GET /api/v1/requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id)
      .populate('hospital', 'name registrationNumber phone email city emergencyContact')
      .populate('bloodBank', 'name licenseNumber phone email city')
      .populate('allocatedUnits', 'unitId bloodGroup componentType expiryDate storageLocation status')
      .populate('requestedBy', 'name email phone')
      .populate('approvedBy', 'name email');

    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    res.status(200).json({
      success: true,
      data: bloodRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve request and allocate compatible units from inventory
// @route   PUT /api/v1/requests/:id/approve
// @access  Private (BloodBank)
const approveBloodRequest = async (req, res, next) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);
    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (bloodRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request cannot be approved because current status is '${bloodRequest.status}'.`,
      });
    }

    const bloodBankId = req.user.bloodBank?._id || req.user.bloodBank;

    // Search for compatible, available, unexpired units in this blood bank
    const availableUnits = await BloodInventory.find({
      bloodBank: bloodBankId,
      componentType: bloodRequest.componentType,
      status: 'available',
      testStatus: 'screened_passed',
      expiryDate: { $gt: new Date() },
    }).sort({ expiryDate: 1 }); // FIFO - First Expiring, First Out

    // Filter units matching immunohematology compatibility
    const compatibleUnits = availableUnits.filter((unit) =>
      isBloodCompatible(bloodRequest.bloodGroup, unit.bloodGroup, bloodRequest.componentType)
    );

    if (compatibleUnits.length < bloodRequest.unitsRequested) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory. Requested ${bloodRequest.unitsRequested} unit(s) of ${bloodRequest.bloodGroup} ${bloodRequest.componentType}, but only ${compatibleUnits.length} compatible available unit(s) found.`,
      });
    }

    // Select the first N units
    const unitsToAllocate = compatibleUnits.slice(0, bloodRequest.unitsRequested);
    const allocatedUnitIds = unitsToAllocate.map((u) => u._id);

    // Reserve the selected units
    await BloodInventory.updateMany(
      { _id: { $in: allocatedUnitIds } },
      {
        $set: {
          status: 'reserved',
          reservedForRequest: bloodRequest._id,
        },
      }
    );

    // Update the request
    bloodRequest.status = 'approved';
    bloodRequest.allocatedUnits = allocatedUnitIds;
    bloodRequest.approvedBy = req.user._id;
    await bloodRequest.save();

    await AuditLog.create({
      action: 'BLOOD_REQUEST_APPROVED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'BloodRequest',
      entityId: bloodRequest.requestId,
      details: {
        allocatedUnitsCount: allocatedUnitIds.length,
        allocatedUnitIds: unitsToAllocate.map((u) => u.unitId),
      },
      ipAddress: req.ip || '127.0.0.1',
    });

    // Send In-App Notification to Requesting Hospital
    try {
      await Notification.create({
        recipientRole: 'hospital',
        recipientHospital: bloodRequest.hospital,
        type: 'REQUEST_STATUS_UPDATE',
        title: `Requisition Approved: ${bloodRequest.requestId}`,
        message: `${allocatedUnitIds.length} compatible unit(s) cross-matched and reserved by blood bank. Ready for packaging.`,
        priority: bloodRequest.urgency === 'Emergency' ? 'emergency' : 'routine',
        link: '/hospital/requests',
      });
    } catch (notifErr) {
      console.error('Notification create error:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Request ${bloodRequest.requestId} approved. ${allocatedUnitIds.length} unit(s) reserved.`,
      data: bloodRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a blood request with reason
// @route   PUT /api/v1/requests/:id/reject
// @access  Private (BloodBank)
const rejectBloodRequest = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clinical or inventory reason for rejection.',
      });
    }

    const bloodRequest = await BloodRequest.findById(req.params.id);
    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // If units were reserved, release them back to available
    if (bloodRequest.allocatedUnits && bloodRequest.allocatedUnits.length > 0) {
      await BloodInventory.updateMany(
        { _id: { $in: bloodRequest.allocatedUnits } },
        { $set: { status: 'available', reservedForRequest: null } }
      );
    }

    bloodRequest.status = 'rejected';
    bloodRequest.rejectionReason = rejectionReason;
    bloodRequest.approvedBy = req.user._id;
    await bloodRequest.save();

    await AuditLog.create({
      action: 'BLOOD_REQUEST_REJECTED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'BloodRequest',
      entityId: bloodRequest.requestId,
      details: { rejectionReason },
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Request ${bloodRequest.requestId} rejected.`,
      data: bloodRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue approved blood units to hospital courier/liaison
// @route   POST /api/v1/requests/:id/issue
// @access  Private (BloodBank)
const issueBloodUnits = async (req, res, next) => {
  try {
    const {
      temperatureAtDispatchCelsius = 4.0,
      icePackIntact = true,
      transportBoxSealed = true,
      recipientStaffName = 'Hospital Transport Officer',
      recipientStaffDesignation = 'Paramedic / Dispatcher',
      recipientContactPhone = '9876543210',
    } = req.body;

    const bloodRequest = await BloodRequest.findById(req.params.id).populate('allocatedUnits');
    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (bloodRequest.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Request must be in 'approved' state to issue blood. Current status is '${bloodRequest.status}'.`,
      });
    }

    const unitIds = bloodRequest.allocatedUnits.map((u) => u._id);

    // Update inventory units to 'issued'
    await BloodInventory.updateMany(
      { _id: { $in: unitIds } },
      { $set: { status: 'issued' } }
    );

    const issueId = generateId('ISS');

    // Create BloodIssue record
    const bloodIssue = await BloodIssue.create({
      issueId,
      bloodRequest: bloodRequest._id,
      hospital: bloodRequest.hospital,
      bloodBank: bloodRequest.bloodBank,
      issuedUnits: bloodRequest.allocatedUnits.map((u) => ({
        unitId: u.unitId,
        bloodInventory: u._id,
        bloodGroup: u.bloodGroup,
        componentType: u.componentType,
        expiryDate: u.expiryDate,
      })),
      issuedBy: req.user._id,
      coldChainVerification: {
        temperatureAtDispatchCelsius,
        icePackIntact,
        transportBoxSealed,
      },
      recipientDetails: {
        staffName: recipientStaffName,
        staffDesignation: recipientStaffDesignation,
        contactPhone: recipientContactPhone,
      },
      status: 'Dispatched',
    });

    bloodRequest.status = 'issued';
    await bloodRequest.save();

    await AuditLog.create({
      action: 'BLOOD_ISSUED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'BloodIssue',
      entityId: bloodIssue.issueId,
      details: {
        issueId,
        requestId: bloodRequest.requestId,
        unitsCount: unitIds.length,
      },
      ipAddress: req.ip || '127.0.0.1',
    });

    // Send In-App Notification to Hospital on Dispatch
    try {
      await Notification.create({
        recipientRole: 'hospital',
        recipientHospital: bloodRequest.hospital,
        type: 'REQUEST_STATUS_UPDATE',
        title: `Cold-Chain Dispatch: ${bloodRequest.requestId}`,
        message: `Units packaged and dispatched at ${temperatureAtDispatchCelsius}°C. Transport box verified sealed. Courier: ${recipientStaffName}. Issue ID: ${issueId}.`,
        priority: bloodRequest.urgency === 'Emergency' ? 'emergency' : 'routine',
        link: '/hospital/received',
      });
    } catch (notifErr) {
      console.error('Notification create error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Blood units issued successfully. Issue ID: ${issueId}`,
      data: bloodIssue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get issued records for a hospital
// @route   GET /api/v1/requests/issues/hospital
// @access  Private (Hospital)
const getHospitalIssuedRecords = async (req, res, next) => {
  try {
    const hospitalId = req.user.hospital?._id || req.user.hospital;
    const issues = await BloodIssue.find({ hospital: hospitalId })
      .populate('bloodBank', 'name city phone emergencyContact')
      .populate('bloodRequest', 'requestId patientName bloodGroup componentType urgency')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm delivery of issued blood units (Hospital Staff)
// @route   PUT /api/v1/requests/:id/deliver
// @access  Private (Hospital, SuperAdmin)
const confirmDelivery = async (req, res, next) => {
  try {
    const { receivedTemperatureCelsius = 4.2, packagingIntact = true, bedsideVerificationNotes = '' } = req.body;
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    if (bloodRequest.status !== 'issued') {
      return res.status(400).json({
        success: false,
        message: `Request must be in 'issued' status to confirm delivery. Current status is '${bloodRequest.status}'.`,
      });
    }

    bloodRequest.status = 'delivered';
    await bloodRequest.save();

    // Update BloodIssue record to 'Delivered'
    const bloodIssue = await BloodIssue.findOne({ bloodRequest: bloodRequest._id });
    if (bloodIssue) {
      bloodIssue.status = 'Delivered';
      await bloodIssue.save();
    }

    // Update allocated inventory units to 'transfused'
    if (bloodRequest.allocatedUnits && bloodRequest.allocatedUnits.length > 0) {
      await BloodInventory.updateMany(
        { _id: { $in: bloodRequest.allocatedUnits } },
        { $set: { status: 'transfused' } }
      );
    }

    await AuditLog.create({
      action: 'BLOOD_DELIVERY_CONFIRMED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'BloodRequest',
      entityId: bloodRequest.requestId,
      details: {
        receivedTemperatureCelsius,
        packagingIntact,
        bedsideVerificationNotes,
      },
      ipAddress: req.ip || '127.0.0.1',
    });

    // Notify Blood Bank
    try {
      await Notification.create({
        recipientRole: 'bloodbank',
        recipientBloodBank: bloodRequest.bloodBank,
        type: 'REQUEST_STATUS_UPDATE',
        title: `Delivery Confirmed: ${bloodRequest.requestId}`,
        message: `Hospital verified receipt and bedside delivery. Transport temperature: ${receivedTemperatureCelsius}°C.`,
        priority: 'routine',
        link: '/bloodbank/requests',
      });
    } catch (notifErr) {
      console.error('Notification create error:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Delivery confirmed and verified for ${bloodRequest.requestId}. Transfusion completed.`,
      data: bloodRequest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBloodRequest,
  getHospitalRequests,
  getBloodBankRequests,
  getRequestById,
  approveBloodRequest,
  rejectBloodRequest,
  issueBloodUnits,
  getHospitalIssuedRecords,
  confirmDelivery,
};
