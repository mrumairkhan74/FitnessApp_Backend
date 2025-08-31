const express = require('express');
const { sendMessage, allMessage } = require('../controllers/MessageController');
const { verifyAccessToken } = require('../middleware/verifyToken')

const router = express.Router();


router.post('/send', verifyAccessToken, sendMessage)
router.get('/:id', verifyAccessToken, allMessage);



module.exports = router;