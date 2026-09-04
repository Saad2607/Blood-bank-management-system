const Appointment = require('../models/Appointment');
const Donor = require('../models/Donor');
const AuditLog = require('../models/AuditLog');

// @desc    Book a donation appointment (Donor)
// @route   POST /api/v1/appointments
// @access  Private (Donor)
const bookAppointment = async (req, res, next) => {
  try {
    const { bloodBankId, appointmentDate, timeSlot, notes } = req.body;

    if (!bloodBankId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Blood bank, appointment date, and time slot are required.',
      });
    }

    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    // Check if appointment date is prior to cooldown date
    const selectedDate = new Date(appointmentDate);
    if (donor.nextEligibleDate && selectedDate < new Date(donor.nextEligibleDate)) {
      return res.status(400).json({
        success: false,
        message: `You are in a cooldown period until ${new Date(
          donor.nextEligibleDate
        ).toLocaleDateString()}. Please select an appointment on or after this date.`,
      });
    }

    const appointment = await Appointment.create({
      donor: donor._id,
      bloodBank: bloodBankId,
      appointmentDate: selectedDate,
      timeSlot,
      notes: notes || '',
      status: 'Booked',
    });

    await AuditLog.create({
      action: 'APPOINTMENT_BOOKED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      entityType: 'Appointment',
      entityId: appointment._id.toString(),
      details: { appointmentDate: selectedDate, timeSlot },
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: 'Donation appointment scheduled successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments for the logged-in donor
// @route   GET /api/v1/appointments/my
// @access  Private (Donor)
const getMyAppointments = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const appointments = await Appointment.find({ donor: donor._id })
      .populate('bloodBank', 'name city street phone operatingHours')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments for blood bank facility
// @route   GET /api/v1/appointments/bloodbank
// @access  Private (BloodBank)
const getBankAppointments = async (req, res, next) => {
  try {
    const bloodBankId = req.user.bloodBank?._id || req.user.bloodBank;
    const appointments = await Appointment.find({ bloodBank: bloodBankId })
      .populate({
        path: 'donor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Completed, Cancelled, No-Show)
// @route   PUT /api/v1/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getBankAppointments,
  updateAppointmentStatus,
};
