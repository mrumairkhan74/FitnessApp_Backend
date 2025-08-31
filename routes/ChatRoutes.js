const express = require('express');
const { createGroup,
    accessChat,
    getChat,
    addToGroup,
    renameGroup,
    removeFromGroup } = require('../controllers/ChatController');
const { verifyAccessToken } = require('../middleware/verifyToken')
const { isManager } = require('../middleware/RoleCheck')

const router = express.Router();

router.post('/accessChat', verifyAccessToken, accessChat)
router.get('/', verifyAccessToken, getChat)
router.post('/group', verifyAccessToken, isManager, createGroup)
router.put('/rename', verifyAccessToken, isManager, renameGroup)
router.put('/add', verifyAccessToken, isManager, addToGroup)
router.put('/remove', verifyAccessToken, isManager, removeFromGroup)

module.exports = router