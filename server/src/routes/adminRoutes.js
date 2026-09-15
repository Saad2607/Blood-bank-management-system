const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('superadmin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.post('/blood-banks', createBloodBank);
router.post('/hospitals', createHospital);
router.get('/audit-logs', getAuditLogs);

// Hospital requisitions oversight
router.get('/requests', getAllRequests);
router.put('/requests/:id/override', overrideRequestStatus);

// Global inventory oversight
router.get('/inventory', getAllInventory);
router.put('/inventory/units/:id/status', overrideUnitStatus);

// Donor & collections oversight
router.get('/donors-overview', getDonorsAndCollections);
router.put('/appointments/:id/status', overrideAppointmentStatus);

module.exports = router;

