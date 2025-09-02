const express = require('express');

const upload = require('../config/upload');
const { createService, DeleteService, getServicesById, getServices, myServices } = require('../controllers/ServiceController');
const { verifyAccessToken } = require('../middleware/verifyToken')
const { isStaff } = require('../middleware/RoleCheck');

const router = express.Router();

router.post('/create', upload.single('img'), isStaff, verifyAccessToken, createService)
router.delete('/:id', verifyAccessToken, DeleteService)
router.get('/:id', verifyAccessToken, getServicesById)
router.get('/', verifyAccessToken, getServices)
router.get('/myServices', verifyAccessToken, myServices)


module.exports = router