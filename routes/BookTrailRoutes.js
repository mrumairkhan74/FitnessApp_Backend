const express = require('express');
const { getBookTrials, getBookTrialsById, createBookTrial, deleteBookTrial,updateBookTrialById } = require('../controllers/BookTrialController');
const { isAdmin, isStaff, isMember } = require('../middleware/RoleCheck')
const { verifyAccessToken } = require('../middleware/verifyToken');
const router = express.Router();

router.get('/', verifyAccessToken, isAdmin, isStaff, getBookTrials)
router.get('/myBookTrials', verifyAccessToken, getBookTrialsById)
router.post('/create', verifyAccessToken, createBookTrial)
router.put('/:id', verifyAccessToken, updateBookTrialById)
router.delete('/:id', verifyAccessToken, isStaff, deleteBookTrial)

module.exports = router;