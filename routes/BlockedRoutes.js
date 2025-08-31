const express = require('express');
const { createBlockSlot, getBlocked, deleteBlock } = require('../controllers/BlockedSlotController');
const { verifyAccessToken } = require('../middleware/verifyToken');
const { isStaff } = require('../middleware/RoleCheck')


const router = express.Router();


router.get('/', verifyAccessToken, getBlocked)
router.post('/create', verifyAccessToken, isStaff, createBlockSlot)
router.delete('/:id', verifyAccessToken, isStaff, deleteBlock)



module.exports = router