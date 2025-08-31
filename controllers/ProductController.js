const ProductModel = require('../models/ProductModel');
const { uploadProduct } = require('../utils/CloudinaryUpload');
const { StaffModel, MemberModel } = require('../models/Discriminators');
const { BadRequestError, NotFoundError, UnAuthorizedError } = require('../middleware/error/httpErrors');




const createProduct = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { name, price, link, paymentOption } = req.body;


        if (!req.file) throw new NotFoundError('Image Not Uploaded')
        const cloudinaryResult = await uploadProduct(req.file.buffer);

        const Product = await ProductModel.create({
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
            $push: { products: Product._id }
        });

        return res.status(200).json({
            status: true,
            message: 'Product Created successfully',
            Product
        })
    }
    catch (error) {
        return next(error)
    }
}

const DeleteProduct = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { ProductId } = req.params;
        const Products = await ProductModel.findById({ ProductId });
        if (Products.createdBy.toString() !== userId) {
            throw new UnAuthorizedError('UnAuthorized You are not enable to Delete this Product')
        }

        await ProductModel.findByIdAndDelete(Products);

        await StaffModel.findByIdAndUpdate(userId, {
            $pull: { products: Products._id }
        })
        return res.status(200).json({
            status: true,
            message: "Products Deleted Successfully "
        })
    }
    catch (error) {
        return next(error)
    }
}

const getProducts = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const Products = await ProductModel.find();
        if (Products.length === 0) throw new NotFoundError('No Product available')
        return res.status(200).json({
            status: true,
            message: 'All Products Below',
            Products
        })
    }
    catch (error) {

    }
}


const myProducts = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const Products = await ProductModel.find({ createdBy: userId }).populate('createdBy', 'firstName lastName').sort({ createdAt: -1 })
        if (!Products) throw new NotFoundError('No Products Created by you');
        return res.status(200).json({
            status: true,
            message: 'Your created Products',
            Products
        })
    }
    catch (error) {
        next(error)
    }
}

const getProductsById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const products = await ProductModel.findById(id).populate('createBy', 'firstName lastName role');
        if (!products) throw new NotFoundError("Invalid Id")
        return res.status(200).json({
            status: true,
            products
        })
    }
    catch (error) {
        next(error)
    }
}
module.exports = {
    createProduct,
    DeleteProduct,
    getProducts,
    getProductsById,
    myProducts
}
