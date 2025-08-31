const express = require('express');
const {
    createMember,
    loginMember,
    updateMemberById,
    deleteMemberById,
    getMemberById,
    getMembers
} = require('../controllers/MemberController');
const { verifyAccessToken, verifyRefreshToken } = require('../middleware/verifyToken');
const { isAdmin, isMember } = require('../middleware/RoleCheck');
const upload = require('../config/upload')
const router = express.Router();

router.get('/members', verifyAccessToken, isAdmin, getMembers)
router.get('/:id', verifyAccessToken, getMemberById)
router.post('/create', upload.single('img'), createMember)
router.post('/login', loginMember)
router.put('/:id', upload.single('img'), verifyAccessToken, updateMemberById)
router.delete('/:id', verifyAccessToken, isAdmin, deleteMemberById)

module.exports = router