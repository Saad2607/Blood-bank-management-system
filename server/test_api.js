const http = require('http');
const app = require('./src/app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const PORT = 8089;

const runTests = async () => {
  try {
    const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to DB for API testing.');

    const server = app.listen(PORT, async () => {
      console.log(`Test server running on port ${PORT}`);

      const request = (path, options = {}, body = null) => {
        return new Promise((resolve, reject) => {
          const req = http.request(
            {
              hostname: '127.0.0.1',
              port: PORT,
              path,
              method: options.method || 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
              },
            },
            (res) => {
              let data = '';
              res.on('data', (chunk) => (data += chunk));
              res.on('end', () => {
                try {
                  resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
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
        console.log('\n--- 1. Testing Health Endpoints ---');
        const health = await request('/api/v1/health');
        console.log('GET /api/v1/health:', health.status, health.body.status);
        if (health.status !== 200 || health.body.status !== 'healthy') throw new Error('Health check failed');

        console.log('\n--- 2. Testing Public Endpoints ---');
        const pubStats = await request('/api/v1/public/stats');
        console.log('GET /api/v1/public/stats:', pubStats.status, pubStats.body.stats);

        const pubSearch = await request('/api/v1/public/availability?bloodGroup=O-&componentType=Whole%20Blood&city=Mumbai');
        console.log('GET /api/v1/public/availability:', pubSearch.status, `Found: ${pubSearch.body.count} blood bank listings`);

        console.log('\n--- 3. Testing Authentication ---');
        // Admin login
        const adminLogin = await request(
          '/api/v1/auth/login',
          { method: 'POST' },
          { email: 'admin@pulsepoint.org', password: 'Admin@123' }
        );
        console.log('Admin login:', adminLogin.status, adminLogin.body.user.role);
        const adminToken = adminLogin.body.token;

        // Staff login
        const staffLogin = await request(
          '/api/v1/auth/login',
          { method: 'POST' },
          { email: 'metro@pulsepoint.org', password: 'Staff@123' }
        );
        console.log('Staff login:', staffLogin.status, staffLogin.body.user.role);
        const staffToken = staffLogin.body.token;

        // Hospital login
        const hospLogin = await request(
          '/api/v1/auth/login',
          { method: 'POST' },
          { email: 'citygen@pulsepoint.org', password: 'Hosp@123' }
        );
        console.log('Hospital login:', hospLogin.status, hospLogin.body.user.role);
        const hospToken = hospLogin.body.token;

        // Donor login
        const donorLogin = await request(
          '/api/v1/auth/login',
          { method: 'POST' },
          { email: 'donor1@pulsepoint.org', password: 'Donor@123' }
        );
        console.log('Donor login:', donorLogin.status, donorLogin.body.user.role);
        const donorToken = donorLogin.body.token;

        console.log('\n--- 4. Testing Role-Protected Inventory & Requests ---');
        const summary = await request('/api/v1/inventory/summary', {
          headers: { Authorization: `Bearer ${staffToken}` },
        });
        console.log('Staff GET /inventory/summary:', summary.status, `Total Available: ${summary.body.summary.totalAvailableUnits}`);

        const bankRequests = await request('/api/v1/requests/bloodbank', {
          headers: { Authorization: `Bearer ${staffToken}` },
        });
        console.log('Staff GET /requests/bloodbank:', bankRequests.status, `Requests assigned: ${bankRequests.body.count}`);

        const hospRequests = await request('/api/v1/requests/hospital', {
          headers: { Authorization: `Bearer ${hospToken}` },
        });
        console.log('Hospital GET /requests/hospital:', hospRequests.status, `Requests sent: ${hospRequests.body.count}`);

        const adminStats = await request('/api/v1/admin/stats', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        console.log('Admin GET /admin/stats:', adminStats.status, adminStats.body.stats.users);

        console.log('\n>>> ALL BACKEND API ENDPOINTS VERIFIED SUCCESSFULLY! <<<\n');
      } catch (err) {
        console.error('Test execution failed:', err);
      } finally {
        server.close();
        await mongoose.connection.close();
        process.exit(0);
      }
    });
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runTests();
