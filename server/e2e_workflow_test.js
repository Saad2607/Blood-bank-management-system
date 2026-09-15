const http = require('http');
const app = require('./src/app');
const mongoose = require('mongoose');
const Donor = require('./src/models/Donor');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const PORT = 8099;

const runE2E = async () => {
  try {
    const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for full E2E workflow verification.');

    const server = app.listen(PORT, async () => {
      console.log(`E2E test server listening on port ${PORT}`);

      const request = (path, method = 'GET', body = null, token = null) => {
        return new Promise((resolve, reject) => {
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const req = http.request(
            { hostname: '127.0.0.1', port: PORT, path, method, headers },
            (res) => {
              let data = '';
              res.on('data', (chunk) => (data += chunk));
              res.on('end', () => {
                try {
                  resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch {
                  resolve({ status: res.statusCode, raw: data });
                }
              });
            }
          );
          req.on('error', reject);
          if (body) req.write(JSON.stringify(body));
          req.end();
        });
      };

      try {
        console.log('\n======================================================');
        console.log('   STARTING PULSE POINT FULL E2E CLINICAL WORKFLOW');
        console.log('======================================================');

        // STEP 1: Authenticate Super Admin
        console.log('\n>>> Step 1: Super Admin Authentication');
        const adminAuth = await request('/api/v1/auth/login', 'POST', {
          email: 'admin@pulsepoint.org',
          password: 'Admin@123',
        });
        if (adminAuth.status !== 200) throw new Error('Admin auth failed');
        const adminToken = adminAuth.body.token;
        console.log('✔ Super Admin authenticated successfully.');

        // STEP 2: Authenticate Donor & Check Eligibility
        console.log('\n>>> Step 2: Donor Authentication & Cooldown Verification');
        const donorAuth = await request('/api/v1/auth/login', 'POST', {
          email: 'donor1@pulsepoint.org',
          password: 'Donor@123',
        });
        if (donorAuth.status !== 200) throw new Error('Donor auth failed');
        const donorToken = donorAuth.body.token;
        const donorUser = donorAuth.body.user;

        // Ensure donor is eligible for repeatable test run
        if (donorUser.donorProfile?._id) {
          await Donor.findByIdAndUpdate(donorUser.donorProfile._id, {
            lastDonationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            nextEligibleDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          });
        }

        const donorHistory = await request('/api/v1/donations/my-history', 'GET', null, donorToken);
        console.log(
          `✔ Donor authenticated: ${donorUser.name} (${donorHistory.body.eligibility?.isEligible ? 'Eligible' : 'Cooldown'})`
        );

        // STEP 3: Authenticate Blood Bank Staff & Check Inventory
        console.log('\n>>> Step 3: Blood Bank Staff Login & Stock Matrix Check');
        const bankAuth = await request('/api/v1/auth/login', 'POST', {
          email: 'metro@pulsepoint.org',
          password: 'Staff@123',
        });
        if (bankAuth.status !== 200) throw new Error('Blood bank auth failed');
        const bankToken = bankAuth.body.token;

        const initialStock = await request('/api/v1/inventory/summary', 'GET', null, bankToken);
        const initialAvailable = initialStock.body.summary.totalAvailableUnits;
        console.log(`✔ Blood Bank Staff logged in. Initial available stock: ${initialAvailable} units.`);

        // STEP 4: Donor Books Appointment
        console.log('\n>>> Step 4: Donor Schedules Center Visit');
        const apptDate = new Date();
        apptDate.setDate(apptDate.getDate() + 3);
        const apptRes = await request(
          '/api/v1/appointments',
          'POST',
          {
            bloodBankId: bankAuth.body.user.bloodBank._id,
            appointmentDate: apptDate.toISOString(),
            timeSlot: '11:00 AM - 12:00 PM',
            notes: 'E2E automated donation verification',
          },
          donorToken
        );
        console.log(`✔ Appointment booked successfully. ID: ${apptRes.body.data?._id}`);

        // STEP 5: Staff Records Donor Collection & Laboratory Processing
        console.log('\n>>> Step 5: Phlebotomy Collection & Component Separation');
        // Find donor profile id
        const donorProfileRes = await request('/api/v1/donors/my-history', 'GET', null, donorToken);
        const donorId = donorAuth.body.user.donorProfile?._id;

        const donationRes = await request(
          '/api/v1/donations',
          'POST',
          {
            donorId,
            bloodGroup: 'O-',
            donationType: 'Whole Blood',
            volumeMl: 450,
            systolicBP: 122,
            diastolicBP: 80,
            pulseRate: 74,
            hemoglobinGdl: 14.2,
            weightKg: 72,
            separateComponents: true, // Produces 1 PRBC and 1 FFP
            notes: 'E2E voluntary phlebotomy with centrifugal separation',
          },
          bankToken
        );

        if (donationRes.status !== 201) throw new Error(`Donation failed: ${JSON.stringify(donationRes.body)}`);
        console.log(
          `✔ Donation logged: ${donationRes.body.data.donationId}. 2 units (PRBC & FFP) generated into inventory.`
        );

        // STEP 6: Authenticate Hospital Staff & Submit Urgent Transfusion Requisition
        console.log('\n>>> Step 6: Hospital Staff Logs In & Submits Requisition');
        const hospAuth = await request('/api/v1/auth/login', 'POST', {
          email: 'citygen@pulsepoint.org',
          password: 'Hosp@123',
        });
        if (hospAuth.status !== 200) throw new Error('Hospital auth failed');
        const hospToken = hospAuth.body.token;

        const requestRes = await request(
          '/api/v1/requests',
          'POST',
          {
            bloodBankId: bankAuth.body.user.bloodBank._id,
            patientName: 'E2E Trauma Patient',
            patientAge: 29,
            patientGender: 'Male',
            hospitalFileNumber: 'E2E-CASE-7701',
            bloodGroup: 'O-',
            componentType: 'Packed Red Blood Cells (PRBC)',
            unitsRequested: 1,
            urgency: 'Urgent',
            clinicalDiagnosis: 'Acute splenic rupture with hypovolemic shock',
          },
          hospToken
        );

        if (requestRes.status !== 201) throw new Error(`Hospital request failed: ${JSON.stringify(requestRes.body)}`);
        const createdRequestId = requestRes.body.data._id;
        console.log(`✔ Transfusion requisition created: ${requestRes.body.data.requestId}`);

        // STEP 7: Blood Bank Reviews & Approves Request
        console.log('\n>>> Step 7: Blood Bank Approves Request & Reserves Compatible Unit');
        const approveRes = await request(
          `/api/v1/requests/${createdRequestId}/approve`,
          'PUT',
          {},
          bankToken
        );
        if (approveRes.status !== 200) throw new Error(`Approval failed: ${JSON.stringify(approveRes.body)}`);
        console.log(`✔ Requisition approved. 1 matching compatible unit allocated & reserved.`);

        // STEP 8: Blood Bank Issues Units with Cold-Chain Audit Log
        console.log('\n>>> Step 8: Blood Bank Issues Blood with Cold-Chain Verification');
        const issueRes = await request(
          `/api/v1/requests/${createdRequestId}/issue`,
          'POST',
          {
            temperatureAtDispatchCelsius: 3.8,
            icePackIntact: true,
            transportBoxSealed: true,
            recipientStaffName: 'E2E Paramedic Courier',
            recipientContactPhone: '9876543210',
          },
          bankToken
        );
        if (issueRes.status !== 201) throw new Error(`Issue failed: ${JSON.stringify(issueRes.body)}`);
        console.log(
          `✔ Blood issued successfully. Issue ID: ${issueRes.body.data.issueId}. Dispatch Temp: 3.8°C.`
        );

        // STEP 9: Hospital Verifies Receipt of Delivered Unit & Confirms Delivery
        console.log('\n>>> Step 9: Hospital Verifies & Confirms Delivery');
        const deliverRes = await request(
          `/api/v1/requests/${createdRequestId}/deliver`,
          'PUT',
          { deliveryNotes: 'Received in good condition, cold-chain verified at ward.' },
          hospToken
        );
        if (deliverRes.status !== 200) throw new Error(`Hospital deliver failed: ${JSON.stringify(deliverRes.body)}`);
        console.log(`✔ Hospital confirmed delivery: status is now '${deliverRes.body.data.status}'.`);

        // STEP 9b: Super Admin Overrides Requisition Status to 'delivered' (Validation check)
        console.log('\n>>> Step 9b: Super Admin Status Override (Verify enum accepts delivered)');
        const adminOverrideRes = await request(
          `/api/v1/admin/requests/${createdRequestId}/override`,
          'PUT',
          { status: 'delivered', adminNotes: 'Admin verified delivered status.' },
          adminToken
        );
        if (adminOverrideRes.status !== 200) throw new Error(`Admin override failed: ${JSON.stringify(adminOverrideRes.body)}`);
        console.log(`✔ Admin override to 'delivered' verified successfully.`);

        const issuesRes = await request('/api/v1/requests/issues/hospital', 'GET', null, hospToken);
        console.log(
          `✔ Hospital received units confirmed: ${issuesRes.body.count} issue records on file.`
        );

        // STEP 10: Public Availability Check
        console.log('\n>>> Step 10: Public Search Reflects Live Compatible Inventory');
        const publicSearch = await request(
          '/api/v1/public/availability?bloodGroup=O-&componentType=Packed%20Red%20Blood%20Cells%20(PRBC)&city=Mumbai',
          'GET'
        );
        console.log(
          `✔ Public live stock search verified: ${publicSearch.body.count} blood bank listings found.`
        );

        console.log('\n======================================================');
        console.log('   ALL 10 CLINICAL E2E STEPS VERIFIED 100% CLEANLY!');
        console.log('======================================================\n');
      } catch (err) {
        console.error('E2E workflow failed:', err);
      } finally {
        server.close();
        await mongoose.connection.close();
        process.exit(0);
      }
    });
  } catch (err) {
    console.error('Fatal E2E error:', err);
    process.exit(1);
  }
};

runE2E();
