const express = require('express');
const router = express.Router();
const {
  recordDonation,
  getBankDonations,
  getMyDonations,
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('bloodbank'), recordDonation);
router.get('/bloodbank', protect, authorize('bloodbank'), getBankDonations);
router.get('/my-history', protect, authorize('donor'), getMyDonations);

module.exports = router;
