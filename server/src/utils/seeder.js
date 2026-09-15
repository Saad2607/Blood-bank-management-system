const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load environment variables
dotenv.config({ path: __dirname + '/../../.env' });

const User = require('../models/User');
const BloodBank = require('../models/BloodBank');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const BloodInventory = require('../models/BloodInventory');
const BloodDonation = require('../models/BloodDonation');
const BloodRequest = require('../models/BloodRequest');
const BloodIssue = require('../models/BloodIssue');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const { calculateExpiryDate, generateId } = require('../services/compatibilityService');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URL or MONGODB_URI not found in environment.');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding...'.cyan.underline);

    // Clear existing collections cleanly
    console.log('Clearing existing Pulse Point collections...'.yellow);
    await User.deleteMany();
    await BloodBank.deleteMany();
    await Hospital.deleteMany();
    await Donor.deleteMany();
    await BloodInventory.deleteMany();
    await BloodDonation.deleteMany();
    await BloodRequest.deleteMany();
    await BloodIssue.deleteMany();
    await Appointment.deleteMany();
    await Notification.deleteMany();
    await AuditLog.deleteMany();

    console.log('Existing collections cleared.'.yellow);

    // 1. Create Blood Banks
    const metroBank = await BloodBank.create({
      name: 'Metro Central Blood Center',
      licenseNumber: 'BB-MH-2024-0042',
      email: 'metro@pulsepoint.org',
      phone: '+91 22 2410 5000',
      street: '42 Health Boulevard, Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400012',
      storageCapacityUnits: 2500,
      operatingHours: '24/7 (Emergency Blood Dispatch Active)',
      emergencyContact: '+91 98200 11223',
      isVerified: true,
      componentSeparationAvailable: true,
    });

    const redCrossBank = await BloodBank.create({
      name: 'Red Cross Regional Blood Center',
      licenseNumber: 'BB-MH-2023-0189',
      email: 'redcross@pulsepoint.org',
      phone: '+91 22 2655 4321',
      street: '15 Red Cross Way, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      storageCapacityUnits: 1800,
      operatingHours: '08:00 AM - 10:00 PM (Emergency on Call)',
      emergencyContact: '+91 98200 44556',
      isVerified: true,
      componentSeparationAvailable: true,
    });

    console.log('Blood Banks created.'.green);

    // 2. Create Hospitals
    const cityGenHospital = await Hospital.create({
      name: 'City General Hospital',
      registrationNumber: 'HOSP-MH-10294',
      hospitalType: 'Government',
      email: 'citygen@pulsepoint.org',
      phone: '+91 22 2200 7000',
      street: '100 Medical Campus Road, Mumbai Central',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400008',
      emergencyContact: '108 / +91 22 2200 7108',
      isVerified: true,
    });

    const stJudeHospital = await Hospital.create({
      name: 'St. Jude Memorial Hospital',
      registrationNumber: 'HOSP-MH-45902',
      hospitalType: 'Private',
      email: 'stjude@pulsepoint.org',
      phone: '+91 22 2840 9000',
      street: '77 Healthcare Heights, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
      emergencyContact: '+91 22 2840 9108',
      isVerified: true,
    });

    console.log('Hospitals created.'.green);

    // 3. Create Users
    // A. Super Admin
    const adminUser = await User.create({
      name: 'Pulse Point Admin',
      email: 'admin@pulsepoint.org',
      password: 'Admin@123',
      role: 'superadmin',
      phone: '+91 99000 00001',
      city: 'Mumbai',
      address: 'Pulse Point HQ, Nariman Point',
    });

    // B. Blood Bank Staff
    const metroStaff = await User.create({
      name: 'Metro Center Phlebotomy Lead',
      email: 'metro@pulsepoint.org',
      password: 'Staff@123',
      role: 'bloodbank',
      phone: '+91 98200 11223',
      city: 'Mumbai',
      bloodBank: metroBank._id,
    });

    const redCrossStaff = await User.create({
      name: 'Red Cross Lab Director',
      email: 'redcross@pulsepoint.org',
      password: 'Staff@123',
      role: 'bloodbank',
      phone: '+91 98200 44556',
      city: 'Mumbai',
      bloodBank: redCrossBank._id,
    });

    // C. Hospital Staff
    const cityGenStaff = await User.create({
      name: 'Dr. Sameer (Trauma ICU)',
      email: 'citygen@pulsepoint.org',
      password: 'Hosp@123',
      role: 'hospital',
      phone: '+91 98200 77889',
      city: 'Mumbai',
      hospital: cityGenHospital._id,
    });

    const stJudeStaff = await User.create({
      name: 'Dr. Anita (Blood Transfusion Officer)',
      email: 'stjude@pulsepoint.org',
      password: 'Hosp@123',
      role: 'hospital',
      phone: '+91 98200 99001',
      city: 'Mumbai',
      hospital: stJudeHospital._id,
    });

    // D. Donors
    const donor1User = await User.create({
      name: 'Saad Donor (Universal O-)',
      email: 'donor1@pulsepoint.org',
      password: 'Donor@123',
      role: 'donor',
      phone: '+91 98111 22334',
      city: 'Mumbai',
      address: 'Plot 12, Parel East',
    });

    const donor2User = await User.create({
      name: 'Ayesha Donor (A+ Regular)',
      email: 'donor2@pulsepoint.org',
      password: 'Donor@123',
      role: 'donor',
      phone: '+91 98222 33445',
      city: 'Mumbai',
      address: '702 Sunshine Apts, Bandra West',
    });

    const donor3User = await User.create({
      name: 'Vikram Donor (B+)',
      email: 'donor3@pulsepoint.org',
      password: 'Donor@123',
      role: 'donor',
      phone: '+91 98333 44556',
      city: 'Mumbai',
      address: 'B-14 Andheri East',
    });

    console.log('Users created with secure bcrypt passwords.'.green);

    // 4. Create Donor Profiles
    const donor1 = await Donor.create({
      user: donor1User._id,
      bloodGroup: 'O-',
      gender: 'Male',
      weightKg: 72,
      lastDonationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago -> Eligible!
      nextEligibleDate: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
      totalDonations: 4,
      isAvailableToDonate: true,
      emergencyContactName: 'Fatima',
      emergencyContactPhone: '+91 98111 00000',
    });

    const donor2 = await Donor.create({
      user: donor2User._id,
      bloodGroup: 'A+',
      gender: 'Female',
      weightKg: 58,
      lastDonationDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000), // Eligible
      nextEligibleDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      totalDonations: 2,
      isAvailableToDonate: true,
    });

    const donor3 = await Donor.create({
      user: donor3User._id,
      bloodGroup: 'B+',
      gender: 'Male',
      weightKg: 68,
      lastDonationDate: null, // First time donor
      nextEligibleDate: new Date(),
      totalDonations: 0,
      isAvailableToDonate: true,
    });

    console.log('Donor profiles linked.'.green);

    // 5. Populate Blood Inventory
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const components = [
      'Whole Blood',
      'Packed Red Blood Cells (PRBC)',
      'Fresh Frozen Plasma (FFP)',
      'Platelet Concentrate',
      'Cryoprecipitate',
    ];

    console.log('Populating unit-level blood inventory with storage coordinates...'.yellow);

    let unitCounter = 100;
    const inventoryUnits = [];

    // Create 4-5 units per group across both banks
    for (const bg of bloodGroups) {
      for (let i = 0; i < 4; i++) {
        unitCounter++;
        const bank = i % 2 === 0 ? metroBank : redCrossBank;
        const comp = components[i % components.length];
        const collectionDaysAgo = Math.floor(Math.random() * 15) + 1;
        const collectionDate = new Date(Date.now() - collectionDaysAgo * 24 * 60 * 60 * 1000);
        const expiryDate = calculateExpiryDate(collectionDate, comp);

        const unit = await BloodInventory.create({
          unitId: `PPU-2026-${unitCounter}`,
          bloodBank: bank._id,
          bloodGroup: bg,
          componentType: comp,
          volumeMl: comp === 'Fresh Frozen Plasma (FFP)' ? 200 : comp === 'Packed Red Blood Cells (PRBC)' ? 280 : 450,
          collectionDate,
          expiryDate,
          storageLocation: {
            rack: `RACK-${bg.replace('+', 'POS').replace('-', 'NEG')}`,
            shelf: `Shelf-${(i % 3) + 1}`,
            temperatureRange: comp.includes('Plasma') || comp.includes('Cryo') ? '-18°C or below' : comp.includes('Platelet') ? '20°C to 24°C' : '2°C to 6°C',
          },
          status: 'available',
          testStatus: 'screened_passed',
        });
        inventoryUnits.push(unit);
      }
    }

    console.log(`Created ${inventoryUnits.length} blood inventory units.`.green);

    // 6. Create Clinical Blood Requests
    // Request 1: Emergency Trauma Request (Approved & Reserved)
    const req1Units = inventoryUnits.filter(
      (u) => u.bloodGroup === 'O-' && u.componentType === 'Packed Red Blood Cells (PRBC)'
    );

    const allocatedUnitIds = req1Units.slice(0, 2).map((u) => u._id);

    const request1 = await BloodRequest.create({
      requestId: 'REQ-2026-00401',
      hospital: cityGenHospital._id,
      bloodBank: metroBank._id,
      patientName: 'Rahul Verma',
      patientAge: 34,
      patientGender: 'Male',
      hospitalFileNumber: 'EM-2026-9041',
      bloodGroup: 'O-',
      componentType: 'Packed Red Blood Cells (PRBC)',
      unitsRequested: 2,
      urgency: 'Emergency',
      clinicalDiagnosis: 'High-speed motor vehicle collision with massive intra-abdominal hemorrhage',
      requiredByDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // In 2 hours
      status: 'approved',
      allocatedUnits: allocatedUnitIds,
      requestedBy: cityGenStaff._id,
      approvedBy: metroStaff._id,
    });

    // Mark those 2 units as reserved
    await BloodInventory.updateMany(
      { _id: { $in: allocatedUnitIds } },
      { $set: { status: 'reserved', reservedForRequest: request1._id } }
    );

    // Request 2: Urgent Cardiac Surgery Request (Pending)
    await BloodRequest.create({
      requestId: 'REQ-2026-00402',
      hospital: stJudeHospital._id,
      bloodBank: metroBank._id,
      patientName: 'Meenakshi Iyer',
      patientAge: 58,
      patientGender: 'Female',
      hospitalFileNumber: 'SURG-2026-118',
      bloodGroup: 'A+',
      componentType: 'Packed Red Blood Cells (PRBC)',
      unitsRequested: 2,
      urgency: 'Urgent',
      clinicalDiagnosis: 'Scheduled coronary artery bypass graft (CABG) surgery tomorrow morning',
      requiredByDate: new Date(Date.now() + 18 * 60 * 60 * 1000),
      status: 'pending',
      requestedBy: stJudeStaff._id,
    });

    // Request 3: Routine Oncology Request (Pending)
    await BloodRequest.create({
      requestId: 'REQ-2026-00403',
      hospital: cityGenHospital._id,
      bloodBank: redCrossBank._id,
      patientName: 'David Dsouza',
      patientAge: 46,
      patientGender: 'Male',
      hospitalFileNumber: 'ONC-2026-3042',
      bloodGroup: 'B+',
      componentType: 'Platelet Concentrate',
      unitsRequested: 1,
      urgency: 'Routine',
      clinicalDiagnosis: 'Severe thrombocytopenia secondary to chemotherapy for Acute Myeloid Leukemia',
      requiredByDate: new Date(Date.now() + 36 * 60 * 60 * 1000),
      status: 'pending',
      requestedBy: cityGenStaff._id,
    });

    console.log('Realistic clinical requests created.'.green);

    // 7. Create Appointments
    await Appointment.create({
      donor: donor1._id,
      bloodBank: metroBank._id,
      appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      timeSlot: '11:00 AM - 12:00 PM',
      status: 'Booked',
      notes: 'Regular voluntary whole blood donation.',
    });

    await Appointment.create({
      donor: donor3._id,
      bloodBank: redCrossBank._id,
      appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      timeSlot: '02:00 PM - 03:00 PM',
      status: 'Booked',
      notes: 'First time voluntary blood donation.',
    });

    console.log('Appointments scheduled.'.green);

    // 8. Seed Discarded Blood Units (Realistic Clinical Wastage Tracking)
    await BloodInventory.create({
      unitId: 'PPU-2026-99011',
      bloodBank: metroBank._id,
      bloodGroup: 'B-',
      componentType: 'Packed Red Blood Cells (PRBC)',
      volumeMl: 450,
      collectionDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // expired 3 days ago
      storageLocation: { rack: 'RACK-DISCARD', shelf: 'Disposal-Bin-1', temperatureRange: '2°C to 6°C' },
      status: 'discarded',
      testStatus: 'screened_passed',
      discardReason: 'outdated',
      discardDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      discardNotes: 'PRBC reached 42-day shelf-life limit without requisitions. Disposed under biomedical protocol.',
    });

    await BloodInventory.create({
      unitId: 'PPU-2026-99012',
      bloodBank: metroBank._id,
      bloodGroup: 'A+',
      componentType: 'Platelet Concentrate',
      volumeMl: 250,
      collectionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      storageLocation: { rack: 'RACK-DISCARD', shelf: 'Disposal-Bin-2', temperatureRange: '20°C to 24°C' },
      status: 'discarded',
      testStatus: 'screened_passed',
      discardReason: 'outdated',
      discardDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      discardNotes: 'Platelet concentrate exceeded 5-day viability limit. Discarded according to safety guidelines.',
    });

    // 9. Seed In-App Notifications (Urgent orders, stock alerts, appointments)
    await Notification.create([
      {
        recipientRole: 'bloodbank',
        recipientBloodBank: metroBank._id,
        type: 'URGENT_REQUEST',
        title: '🚨 EMERGENCY: 2x O- PRBC Transfusion Order',
        message: 'City General Hospital (Trauma ICU) submitted emergency requisition for acute polytrauma resuscitation.',
        priority: 'emergency',
        link: '/bloodbank/requests',
        isRead: false,
      },
      {
        recipientRole: 'bloodbank',
        recipientBloodBank: metroBank._id,
        type: 'EXPIRING_UNIT',
        title: '⚠️ Expiry Alert: Platelet Unit PPU-2026-0004',
        message: 'Platelet concentrate unit is within 48 hours of expiration. Prioritize for compatible requisitions.',
        priority: 'urgent',
        link: '/bloodbank/inventory',
        isRead: false,
      },
      {
        recipientRole: 'hospital',
        recipientHospital: cityGenHospital._id,
        type: 'REQUEST_STATUS_UPDATE',
        title: 'Requisition Approved: REQ-2026-1002',
        message: 'Metro Central Blood Center has approved and reserved 1 unit of A+ Whole Blood. Packaging in progress.',
        priority: 'routine',
        link: '/hospital/requests',
        isRead: false,
      },
      {
        recipientRole: 'donor',
        recipientUser: donor1User._id,
        type: 'APPOINTMENT_UPDATE',
        title: 'Donation Appointment Confirmed',
        message: 'Your appointment at Metro Central Blood Center is confirmed for tomorrow at 10:00 AM. Thank you for saving lives!',
        priority: 'routine',
        link: '/donor/appointments',
        isRead: false,
      },
    ]);

    console.log('Notifications and wastage tracking seeded.'.green);

    // 10. Create Initial Audit Logs
    await AuditLog.create({
      action: 'SYSTEM_SEEDED',
      performedByName: 'Pulse Point Seeder Engine',
      role: 'superadmin',
      entityType: 'System',
      entityId: 'SEED-2026',
      details: {
        message: 'Master seed dataset successfully initialized with realistic clinical data.',
      },
      ipAddress: '127.0.0.1',
    });

    console.log('Audit logs written.'.green);

    console.log('\n======================================================'.magenta);
    console.log('   PULSE POINT DATABASE SEED COMPLETED SUCCESSFULLY!'.magenta.bold);
    console.log('======================================================'.magenta);
    console.log('\nDemo Credentials:'.bold);
    console.log('  Super Admin:      admin@pulsepoint.org    / Admin@123');
    console.log('  Blood Bank Staff: metro@pulsepoint.org    / Staff@123');
    console.log('  Blood Bank Staff: redcross@pulsepoint.org / Staff@123');
    console.log('  Hospital Staff:   citygen@pulsepoint.org  / Hosp@123');
    console.log('  Hospital Staff:   stjude@pulsepoint.org   / Hosp@123');
    console.log('  Donor (O-):       donor1@pulsepoint.org   / Donor@123');
    console.log('  Donor (A+):       donor2@pulsepoint.org   / Donor@123');
    console.log('  Donor (B+):       donor3@pulsepoint.org   / Donor@123');
    console.log('======================================================\n'.magenta);

    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`.red.bold);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();
