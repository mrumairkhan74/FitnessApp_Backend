const express = require('express');
const router = express.Router();


const { getCampaign } = require('../controllers/MetaAdsController')
const { verifyAccessToken } = require('../middleware/verifyToken')


router.get('/', verifyAccessToken, getCampaign)

module.exports = router