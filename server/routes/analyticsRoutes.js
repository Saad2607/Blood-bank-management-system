const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { bloodGroupDetailsController, bloodGroupDetailsHospitalController } = require("../controllers/analyticsController");

const router = express.Router();

// routes
// GET BLOOD DATA
router.get("/bloodGroups-data", authMiddleware, bloodGroupDetailsController);

// GET BLOOD DATA FOR HOSPITAL
router.get("/bloodGroups-data-hospital", authMiddleware, bloodGroupDetailsHospitalController);

module.exports = router;