const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const requestRoutes = require('./routes/requestRoutes');
const donationRoutes = require('./routes/donationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// CORS Configuration - Permissive for seamless cross-deployment between Vercel & Render
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // In production and dev, allow localhost, preview deployments, and custom domain
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health Check Endpoints (Critical for Render and Vercel monitors)
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Pulse Point Blood Bank API is operational',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'Pulse Point API',
    tagline: 'Connecting Hospitals, Blood Banks, and Donors',
    version: '2.0.0',
    status: 'online',
    healthCheck: '/api/v1/health',
  });
});

// Mount API Routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
