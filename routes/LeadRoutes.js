const express = require('express')
const { createLead, getLead, getLeadById, updateLeadById, deleteLead, getLeadsByUser } = require('../controllers/LeadController')
const { verifyAccessToken } = require('../middleware/verifyToken')
const { isMember, isStaff } = require('../middleware/RoleCheck')

const router = express.Router();



router.get('/', verifyAccessToken, getLead);
router.get('/myLeads', verifyAccessToken, getLeadsByUser);
router.get('/:id', verifyAccessToken, getLeadById);
router.post('/create', verifyAccessToken, isStaff, createLead);
router.put('/:id', verifyAccessToken, updateLeadById);
router.delete('/:id', verifyAccessToken, deleteLead);


module.exports = router