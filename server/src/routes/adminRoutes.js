const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  createBloodBank,
  createHospital,
  getAuditLogs,
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

module.exports = router;
