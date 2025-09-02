const express = require('express');
const { verifyAccessToken } = require('../middleware/verifyToken');
const { createContract, getContractPdfById, downloadContractPdf,keepMembership,cancelMembership,myContract } = require('../controllers/ContractController');
const { isStaff } = require('../middleware/RoleCheck');

const router = express.Router();

router.post('/create', verifyAccessToken, isStaff, createContract);
router.get('/myContract', verifyAccessToken, myContract);
router.get('/:id', verifyAccessToken, getContractPdfById);
router.get('/download/:id', verifyAccessToken, downloadContractPdf);
router.put('/cancel/:id', verifyAccessToken, cancelMembership);
router.put('/keep/:id', verifyAccessToken, keepMembership);

module.exports = router;