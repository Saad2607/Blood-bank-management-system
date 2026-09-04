const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventorySummary,
  addBloodUnit,
  updateBloodUnit,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, getInventory);
router.get('/summary', protect, getInventorySummary);
router.post('/units', protect, authorize('bloodbank', 'superadmin'), addBloodUnit);
router.put('/units/:id', protect, authorize('bloodbank', 'superadmin'), updateBloodUnit);

module.exports = router;
