const express = require('express');
const { createAdmin, loginAdmin, getUsers, updateAdminById, logout, deleteUser } = require('../controllers/AdminController');
const { isAdmin } = require('../middleware/RoleCheck');
const { verifyAccessToken } = require('../middleware/verifyToken');
const { forgetPassword, resetPassword, requestEmailChange, changePassword } = require('../controllers/AuthController');
const upload = require('../config/upload')
const router = express.Router();


router.post('/create', upload.single('img'), createAdmin)
router.put('/:id', upload.single('img'), updateAdminById)
router.post('/login', loginAdmin)
router.post('/logout', verifyAccessToken, logout)
router.post('/forget-password', forgetPassword)
router.post('/reset-password/:token', resetPassword)
router.post('/reset-email', verifyAccessToken, requestEmailChange)
router.post('/changePassword', verifyAccessToken, changePassword)
router.get('/users', verifyAccessToken, isAdmin, getUsers)
router.delete('/:id', verifyAccessToken, isAdmin, deleteUser)


module.exports = router