const express = require('express');
const router = express.Router();

const upload = require('../config/upload');
const { createProduct, DeleteProduct, getProductsById, getProducts, myProducts } = require('../controllers/ProductController');
const { verifyAccessToken } = require('../middleware/verifyToken')
const { isStaff } = require('../middleware/RoleCheck');

router.post('/create', upload.single('img'), isStaff, verifyAccessToken, createProduct)
router.delete('/:id', verifyAccessToken, DeleteProduct)
router.get('/:id', verifyAccessToken, getProductsById)
router.get('/', verifyAccessToken, getProducts)
router.get('/myProducts', verifyAccessToken, myProducts)


module.exports = router