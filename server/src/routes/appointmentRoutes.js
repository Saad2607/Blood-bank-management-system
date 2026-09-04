const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getBankAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('donor'), bookAppointment);
router.get('/my', protect, authorize('donor'), getMyAppointments);
router.get('/bloodbank', protect, authorize('bloodbank'), getBankAppointments);
router.put('/:id/status', protect, authorize('bloodbank'), updateAppointmentStatus);

module.exports = router;
