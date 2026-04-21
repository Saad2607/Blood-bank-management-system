const userModel = require("../models/userModel");

// GET DONAR LIST
const getDonarsListController = async (req, res) => {
    try {
        const donarData = await userModel.find({role: 'donar'}).sort({createdAt: -1});

        return res.status(200).send({
            success: true,
            TotalCount: donarData.length,
            message: 'Donar Data Fetched Successfully',
            donarData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in Donar List API',
            error,
        })
    }
};

const getDonarsListForHospitalController = async (req, res) => {
    try {
        const donarDataForHospital = await userModel.find({role: 'donar'}).sort({createdAt: -1});

        return res.status(200).send({
            success: true,
            TotalCount: donarDataForHospital.length,
            message: 'Donar Data For Hospital Fetched Successfully',
            donarDataForHospital,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in Donar List API',
            error,
        });
    }
};

// GET HOSPITAL LIST
const getHospitalsListController = async (req, res) => {
    try {
        const hospitalData = await userModel.find({role: 'hospital'}).sort({createdAt: -1});

        return res.status(200).send({
            success: true,
            TotalCount: hospitalData.length,
            message: 'Hospital Data Fetched Successfully',
            hospitalData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in Hospital List API',
            error,
        })
    }
};

// GET ORGANIZATION LIST
const getOrganizationListController = async (req, res) => {
    try {
        const organizationData = await userModel.find({role: 'organization'}).sort({createdAt: -1});

        return res.status(200).send({
            success: true,
            TotalCount: organizationData.length,
            message: 'Organization Data Fetched Successfully',
            organizationData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in Organization List API',
            error,
        })
    }
};

// DELETE DONAR
const deleteDonarController = async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.params.id);
        return res.status(200).send({
            success: true,
            message: 'Donar Record Deleted Successfully',
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error while deleting donar',
            error,
        })
    }
};

const deleteHospitalController = async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.params.id);
        return res.status(200).send({
            success: true,
            message: 'Hospital Record Deleted Successfully',
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error while deleting hospital',
            error,
        })
    }
};

const deleteOrganizationController = async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.params.id);
        return res.status(200).send({
            success: true,
            message: 'Organization Record Deleted Successfully',
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error while deleting Organization',
            error,
        })
    }
};

module.exports = { 
    getDonarsListController, 
    getDonarsListForHospitalController,
    getHospitalsListController, 
    getOrganizationListController, 
    deleteDonarController, 
    deleteHospitalController,
    deleteOrganizationController
};