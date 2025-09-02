const {
    exchangeCodeForShortToken,
    exchangeForLongAccessToken,
    getAdAccounts,
    getUserProfile
} = require('../utils/MetaClient');
const { encrypt, decrypt } = require('../utils/CryptoToken');
const { NotFoundError } = require('../middleware/error/httpErrors');
const MetaAdsModel = require('../models/MetaAdsModel');




const APP_ID = process.env.META_APP_ID
const APP_SECRET = process.env.META_APP_SECRET
const REDIRECT_URI = process.env.META_REDIRECT_URI
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fitness-web-kappa.vercel.app/'


if (!APP_ID || !APP_SECRET || !REDIRECT_URI) {
    console.warn('META_AP_ID,META_APP_SECRET, and META_REDIRECT_URI should be set in .env');
}


// ==== get Auth URl ====


const getAuthUrl = async (req, res) => {
    const state = req.user?.id;
    const scopes = [
        'ads_management',
        'ads_read',
        'business_management',
        'read_insights',

    ].join(',');
    const url = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}&response_type=code`;
    res.json({ url });
};



// === o Auth Call Back ===

const oauthCallBack = async (req, res) => {
    try {
        const { code, state } = req.query;
        const createdBy = state || req.user?.id;
        if (!createdBy) throw new NotFoundError('Missing User (state required)');

        const shortCode = await exchangeCodeForShortToken({
            code,
            redirectUri: REDIRECT_URI,
            appId: APP_ID,
            appSecret: APP_SECRET
        });
        const shortToken = shortCode.access_token;
        const longCode = await exchangeForLongAccessToken({
            shortToken,
            appId: APP_ID,
            appSecret: APP_SECRET
        });

        const longToken = longCode.access_token;
        const expiresIn = longCode.expires_in;

        const profile = await getUserProfile({ accessToken: longToken, fields: 'id,name,email' });
        const accountsRes = await getAdAccounts({ accessToken: longToken });

        const accounts = (accountsRes.data || []).map(a => ({
            id: a.id,
            name: a.name,
            accountStatus: a.account_status
        }))

        const enc = encrypt(longToken);
        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        const connection = await MetaAdsModel.findOneAndUpdate({ createdBy }, {
            fbUserId: profile.id,
            encryptedAccessToken: enc,
            expiresAt,
            adAccounts: accounts,
            metaId: APP_ID,

        }, {
            upsert: true, new: true
        }
        );
        return res.redirect(`${FRONTEND_URL}/meta-connected?success=1`);

    }
    catch (error) {
        return res.redirect(`${FRONTEND_URL}/meta-connected?success=0&error=${encodeURIComponent(error.message)}`);
    }
}


// === get Connection with meta ===

const getConnections = async (req, res) => {
    const conns = await MetaAdsModel.find({ createdBy: req.user?.id }).select('-encryptedAccessToken');
    res.json(conns);
};


// === acc sync with meta ===

const syncAdAccounts = async (req, res) => {
    const conn = await MetaAdsModel.findOne({ createdBy: req.user?.id })
    if (!conn) throw new NotFoundError('No Meta Connection found ')
    const token = decrypt(conn.encryptedAccessToken);
    const accountsRes = await getAdAccounts({ accessToken: token });
    const accounts = (accountsRes.data || []).map(a => ({
        id: a.id,
        name: a.name,
        accountStatus: a.account_status
    }))
    conn.adAccounts = accounts
    await conn.save();

    res.json({ adAccounts: accounts })
}


// === remove connection ===

const revokeConnection = async (req, res) => {
    const conn = await MetaAdsModel.findOneAndDelete({ createdBy: req.user?.id });
    if (!conn) throw new NotFoundError("No connection found");
    res.json({ message: "Connection Removed" })
}

module.exports = {
    getAuthUrl,
    oauthCallBack,
    getConnections,
    syncAdAccounts,
    revokeConnection

}


