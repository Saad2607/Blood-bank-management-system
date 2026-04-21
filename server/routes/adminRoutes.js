const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getDonarsListController, getHospitalsListController, getOrganizationListController, deleteDonarController, deleteHospitalController, deleteOrganizationController, getDonarsListForHospitalController } = require('../controllers/adminController');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Router Object
const router = express.Router();

// Routes

// GET || DONAR LIST
router.get('/donar-list', authMiddleware, adminMiddleware, getDonarsListController);

// GET || DONAR LIST FOR HOSPITAL
router.get('/donar-list-Hospital', authMiddleware, getDonarsListForHospitalController);

// GET || HOSPITAL LIST
router.get('/hospital-list', authMiddleware, adminMiddleware, getHospitalsListController);

// GET || HOSPITAL LIST
router.get('/organization-list', authMiddleware, adminMiddleware, getOrganizationListController);

// GET || DELETE DONAR
router.delete('/delete-donar/:id', authMiddleware, adminMiddleware, deleteDonarController);

// GET || DELETE DONAR
router.delete('/delete-hospital/:id', authMiddleware, adminMiddleware, deleteHospitalController);

// GET || DELETE DONAR
router.delete('/delete-organization/:id', authMiddleware, adminMiddleware, deleteOrganizationController);

// Export
module.exports = router;