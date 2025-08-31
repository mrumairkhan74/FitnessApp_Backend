const express = require('express');
const {
    createStaff,
    loginStaff,
    updateStaffById,
    getStaffById,
    getStaff,
    deleteStaffById,
} = require('../controllers/StaffController');
const { verifyAccessToken, verifyRefreshToken } = require('../middleware/verifyToken');
const { isAdmin } = require('../middleware/RoleCheck');
const upload = require('../config/upload')
const router = express.Router();


router.get('/staff', verifyAccessToken,isAdmin, getStaff)
router.get('/:id', verifyAccessToken, getStaffById)
router.post('/create', upload.single('img'), createStaff)
router.post('/login', loginStaff)
router.put('/:id', upload.single('img'), verifyAccessToken, updateStaffById)
router.delete('/:id', verifyAccessToken, deleteStaffById)

module.exports = router