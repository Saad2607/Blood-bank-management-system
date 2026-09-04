const express = require('express');
const router = express.Router();
const {
  searchBloodAvailability,
  getVerifiedBloodBanks,
  getVerifiedHospitals,
  getPublicStats,
} = require('../controllers/publicController');

router.get('/availability', searchBloodAvailability);
router.get('/blood-banks', getVerifiedBloodBanks);
router.get('/hospitals', getVerifiedHospitals);
router.get('/stats', getPublicStats);

module.exports = router;
