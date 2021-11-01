const _ = require("lodash");
const DoctorType = require("../Model/DoctorType");
const DoctorTypeConstant = require("../Constants/DoctorTypeConstant");

const getAllDoctorTypes = async (req, res) => {
    await DoctorType.find({}).then(data => {
        if(!_.isEmpty(data)){
            const {code, message} = DoctorTypeConstant.DOCTOR_TYPE_GET_SUCCESS
            return res.status(code).json({ data, code, message });
        } else {
            const {code} = DoctorTypeConstant.DOCTOR_TYPE_GET_ERROR
            return res.status(code).json(DoctorTypeConstant.DOCTOR_TYPE_GET_ERROR);
        }
    });
}

const getOneDoctorType = async (req, res) => {
    const doctor_type = req.params.id;
    await DoctorType.findById({_id: doctor_type}).then(data => {
        if(!_.isEmpty(data)){
            const {code, message} = DoctorTypeConstant.DOCTOR_TYPE_GET_SUCCESS;
            return res.status(code).json({ data, code, message });
        } else {
            const {code} = DoctorTypeConstant.DOCTOR_TYPE_GET_ERROR;
            return res.status(code).json(DoctorTypeConstant.DOCTOR_TYPE_GET_ERROR);
        }
    })
}

const createDoctorType = async(req, res) => {
    const {category_name} = req.body;
    const doctorType = new DoctorType({category_name});
    await doctorType.save().then(data => {
        const {code, message} = DoctorTypeConstant.DOCTOR_TYPE_CREATE_SUCCESS;
        return res.status(code).json({ data, code, message });
    }).catch(error => {
        const {code, message} = DoctorTypeConstant.DOCTOR_TYPE_CREATE_ERROR;
        return res.status(code).json({code, message, error: error.errors});
    });
}

const updateDoctorTypes = async(req, res) => {
    doctor_type_id = req.params.id;
    const {category_name} = req.body;
    await DoctorType.findByIdAndUpdate({_id : doctor_type_id}, {category_name}).then(data => {
        const {code, message} = DoctorTypeConstant.DOCTOR_TYPE_UPDATE_SUCCESS;
        return res.status(code).json({ code, message });
    }).catch(error => {
        const {code, message} = DoctorTypeConstant.DOCTOR_TYPE_UPDATE_ERROR;
        return res.status(code).json({code, message, error: error.errors});
    });
}

const deleteDoctorTypes = async(req, res) => {
    doctor_type_id = req.params.id;
    await DoctorType.findByIdAndDelete({_id : doctor_type_id}).then(data => {
        const {code, message} = DoctorTypeConstant.DOCTOR_TYPE_DELETE_SUCCESS;
        return res.status(code).json({ code, message });
    }).catch(error => {
        const {code, message} = DoctorTypeConstant.DOCTOR_TYPE_DELETE_ERROR;
        return res.status(code).json({code, message, error: error.errors});
    });
}

module.exports = {
    getOneDoctorType,
    createDoctorType,
    updateDoctorTypes,
    deleteDoctorTypes,
    getAllDoctorTypes,
}