const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../middleware/verifyToken');
const { createContract, getContractPdfById, downloadContractPdf } = require('../controllers/ContractController');
const { isStaff } = require('../middleware/RoleCheck');

router.post('/create', verifyAccessToken, isStaff, createContract);
router.get('/:id', verifyAccessToken, getContractPdfById);
router.get('/download/:id', verifyAccessToken, downloadContractPdf);

module.exports = router;