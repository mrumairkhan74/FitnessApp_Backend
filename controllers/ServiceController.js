const ServiceModel = require('../models/ServiceModel');
const { uploadProduct } = require('../utils/CloudinaryUpload');
const { StaffModel, MemberModel } = require('../models/Discriminators');
const { BadRequestError, NotFoundError, UnAuthorizedError } = require('../middleware/error/httpErrors');




const createService = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { name, price, link, paymentOption } = req.body;


        if (!req.file) throw new NotFoundError('Image Not Uploaded')
        const cloudinaryResult = await uploadProduct(req.file.buffer);

        const service = await ServiceModel.create({
            name,
            price,
            link,
            paymentOption,
            img: {
                url: cloudinaryResult.secure_url,
                public_id: cloudinaryResult.public_id
            }
        })

        await StaffModel.findByIdAndUpdate(userId, {
            $push: { services: service._id }
        });

        return res.status(200).json({
            status: true,
            message: 'Service Created successfully',
            service
        })
    }
    catch (error) {
        return next(error)
    }
}

const DeleteService = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { serviceId } = req.params;
        const services = await ServiceModel.findById({ serviceId });
        if (services.createdBy.toString() !== userId) {
            throw new UnAuthorizedError('UnAuthorized You are not enable to Delete this Service')
        }

        await ServiceModel.findByIdAndDelete(services);

        await StaffModel.findByIdAndUpdate(userId, {
            $pull: { services: services._id }
        })
        return res.status(200).json({
            status: true,
            message: "Services Deleted Successfully "
        })
    }
    catch (error) {
        return next(error)
    }
}

const getServices = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const services = await ServiceModel.find();
        if (services.length === 0) throw new NotFoundError('No service available')
        return res.status(200).json({
            status: true,
            message: 'All services Below',
            services
        })
    }
    catch (error) {

    }
}


const myServices = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const services = await ServiceModel.find({ createdBy: userId }).populate('createdBy', 'firstName lastName').sort({ createdAt: -1 })
        if (!services) throw new NotFoundError('No services Created by you');
        return res.status(200).json({
            status: true,
            message: 'Your created Services',
            services
        })
    }
    catch (error) {
        next(error)
    }
}

const getServicesById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const services = await ServiceModel.findById(id).populate('createBy', 'firstName lastName role');
        if (!services) throw new NotFoundError("Invalid Id")
        return res.status(200).json({
            status: true,
            services
        })
    }
    catch (error) {
        next(error)
    }
}

module.exports = {
    createService,
    DeleteService,
    getServices,
    getServicesById,
    myServices
}
