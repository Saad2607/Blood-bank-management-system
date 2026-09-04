const express = require('express');
const router = express.Router();
const {
  createBloodRequest,
  getHospitalRequests,
  getBloodBankRequests,
  getRequestById,
  approveBloodRequest,
  rejectBloodRequest,
  issueBloodUnits,
  getHospitalIssuedRecords,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('hospital'), createBloodRequest);
router.get('/hospital', protect, authorize('hospital'), getHospitalRequests);
router.get('/bloodbank', protect, authorize('bloodbank'), getBloodBankRequests);
router.get('/issues/hospital', protect, authorize('hospital'), getHospitalIssuedRecords);
router.get('/:id', protect, getRequestById);
router.put('/:id/approve', protect, authorize('bloodbank'), approveBloodRequest);
router.put('/:id/reject', protect, authorize('bloodbank'), rejectBloodRequest);
router.post('/:id/issue', protect, authorize('bloodbank'), issueBloodUnits);

module.exports = router;
