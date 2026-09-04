const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Donor = require('../models/Donor');
const BloodBank = require('../models/BloodBank');
const Hospital = require('../models/Hospital');
const AuditLog = require('../models/AuditLog');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'fallback_secret_key_pulse_point',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new user (Donor, Hospital, Blood Bank, or Public)
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = 'donor',
      city,
      address,
      bloodGroup,
      gender,
      weightKg,
      bloodBankId,
      hospitalId,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone number.',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Role-specific validation
    let assignedBloodBank = bloodBankId || null;
    let assignedHospital = hospitalId || null;

    if (role === 'bloodbank' && !assignedBloodBank) {
      // Find default or first verified blood bank if not explicitly provided
      const defaultBank = await BloodBank.findOne();
      if (defaultBank) assignedBloodBank = defaultBank._id;
    }

    if (role === 'hospital' && !assignedHospital) {
      const defaultHospital = await Hospital.findOne();
      if (defaultHospital) assignedHospital = defaultHospital._id;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      phone,
      role,
      city: city || 'Mumbai',
      address: address || '',
      bloodBank: assignedBloodBank,
      hospital: assignedHospital,
    });

    // If role is donor, create associated Donor profile
    let donorProfile = null;
    if (role === 'donor') {
      donorProfile = await Donor.create({
        user: user._id,
        bloodGroup: bloodGroup || 'O+',
        gender: gender || 'Male',
        weightKg: weightKg || 60,
      });
    }

    // Audit Log
    await AuditLog.create({
      action: 'USER_REGISTERED',
      performedBy: user._id,
      performedByName: user.name,
      role: user.role,
      entityType: 'User',
      entityId: user._id.toString(),
      details: { email: user.email, role: user.role },
      ipAddress: req.ip || '127.0.0.1',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        address: user.address,
        bloodBank: user.bloodBank,
        hospital: user.hospital,
        donorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('bloodBank')
      .populate('hospital');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    let donorProfile = null;
    if (user.role === 'donor') {
      donorProfile = await Donor.findOne({ user: user._id });
    }

    const token = generateToken(user._id, user.role);

    // Audit Log
    await AuditLog.create({
      action: 'USER_LOGIN',
      performedBy: user._id,
      performedByName: user.name,
      role: user.role,
      entityType: 'User',
      entityId: user._id.toString(),
      details: { email: user.email, role: user.role },
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        address: user.address,
        bloodBank: user.bloodBank,
        hospital: user.hospital,
        donorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('bloodBank')
      .populate('hospital');

    let donorProfile = null;
    if (user.role === 'donor') {
      donorProfile = await Donor.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        address: user.address,
        bloodBank: user.bloodBank,
        hospital: user.hospital,
        donorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, bloodGroup, weightKg } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;

    await user.save();

    let donorProfile = null;
    if (user.role === 'donor') {
      donorProfile = await Donor.findOne({ user: user._id });
      if (donorProfile) {
        if (bloodGroup) donorProfile.bloodGroup = bloodGroup;
        if (weightKg) donorProfile.weightKg = weightKg;
        await donorProfile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        address: user.address,
        bloodBank: user.bloodBank,
        hospital: user.hospital,
        donorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
};
