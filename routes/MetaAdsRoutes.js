// routes/metaRoutes.js
const express = require('express');
const {
    getAuthUrl,
    oauthCallBack,
    getConnections,
    syncAdAccounts,
    revokeConnection
} = require('../controllers/MetaAdsController');
const { verifyAccessToken } = require('../middleware/verifyToken'); // adapt to your middleware

const router = express.Router();

router.get('/auth-url', verifyAccessToken, getAuthUrl);
router.get('/callback', oauthCallBack); // callback must be public (FB will call it)
router.get('/connections', verifyAccessToken, getConnections);
router.post('/sync', verifyAccessToken, syncAdAccounts);
router.post('/revoke', verifyAccessToken, revokeConnection);

module.exports = router;
