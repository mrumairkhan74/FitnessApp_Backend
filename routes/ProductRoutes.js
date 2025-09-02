const express = require('express');

const upload = require('../config/upload');
const { createProduct, DeleteProduct, getProductsById, getProducts, myProducts } = require('../controllers/ProductController');
const { verifyAccessToken } = require('../middleware/verifyToken')
const { isStaff } = require('../middleware/RoleCheck');

const router = express.Router();

router.post('/create', upload.single('img'), isStaff, verifyAccessToken, createProduct)
router.delete('/:id', verifyAccessToken, isStaff, DeleteProduct)
router.get('/:id', verifyAccessToken, getProductsById)
router.get('/', verifyAccessToken, getProducts)
router.get('/myProducts', verifyAccessToken, myProducts)


module.exports = router