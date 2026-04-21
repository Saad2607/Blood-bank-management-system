const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { 
    createInventoryController, 
    getInventoryController, 
    getDonarsController, 
    getHospitalsController, 
    getOrganizationsController, 
    getOrganizationsForHospitalController,
    getInventoryHospitalController,
    getRecentInventoryController,
    getRecentInventoryHospitalController,
    getUserBloodTypeController,
    getHospitalBloodGroupsController
} = require("../controllers/inventoryController");

const router = express.Router();

// routes
// ADD INVENTORY || POST
router.post("/create-inventory", authMiddleware, createInventoryController);

// GET HOSPITAL BLOOD TYPE
router.get("/get-hospital-blood-group", authMiddleware, getHospitalBloodGroupsController);
// GET USER'S BLOOD TYPE
router.get("/get-blood-type", authMiddleware, getUserBloodTypeController);

// GET ALL BLOOD RECORDS
router.get("/get-inventory", authMiddleware, getInventoryController);

// GET RECENT BLOOD RECORDS
router.get("/get-recent-inventory", authMiddleware, getRecentInventoryController);

// GET RECENT BLOOD RECORDS FOR HOSPITAL
router.get("/get-recent-inventory-hospital", authMiddleware, getRecentInventoryHospitalController);

// GET HOSPITAL BLOOD RECORDS
router.post("/get-inventory-hospital", authMiddleware, getInventoryHospitalController);

// GET DONAR RECORDS
router.get("/get-donars", authMiddleware, getDonarsController);

// GET HOSPITAL RECORDS
router.get("/get-hospitals", authMiddleware, getHospitalsController);

// GET ORGANIZATION RECORDS
router.get("/get-organizations", authMiddleware, getOrganizationsController);

// GET ORGANIZATION RECORDS FOR HOSPITAL
router.get("/get-organizations-for-hospital", authMiddleware, getOrganizationsForHospitalController);

module.exports = router;