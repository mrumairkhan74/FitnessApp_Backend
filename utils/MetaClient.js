const axios = require('axios');

const GRAPH = process.env.GRAPH_BASE

async function exchangeCodeForShortToken({ code, redirectUri, appId, appSecret }) {
    const url = `${GRAPH}/v16.0/oauth/access_token`;
    const res = await axios.get(url, {
        params: {
            client_id: appId,
            redirect_uri: redirectUri,
            client_secret: appSecret,
            code
        }
    });
    return res.data;
}




async function exchangeForLongAccessToken({ shortToken, appId, appSecret }) {
    const url = `${GRAPH}/v16.0/oauth/access_token`;
    const res = await axios.get(url, {
        params: {
            grant_type: 'fb_exchange_token',
            client_id: appId,
            client_secret: appSecret,
            fb_exchange_token: shortToken
        }
    });
    return res.data;
}



async function getUserProfile({ accessToken, fields = 'id,name,email' }) {
    const url = `${GRAPH}/me`;
    const res = await axios.get(url, {
        params: {
            access_token: accessToken,
            fields: 'id,name,account_status'
        }
    });
    return res.data;
}

async function getAdAccounts({ accessToken }) {
    const url = `${GRAPH}/me/adaccounts`;
    const res = await axios.get(url, {
        params: { access_token: accessToken, fields: 'id,name,account_status' }
    });
    return res.data;
}



async function getCampaign({ accessToken, adAccountId, params = 'id,name,status,effective_status' }) {
    const url = `${GRAPH}/v16.0/${adAccountId}/campaigns`;
    const res = await axios.get(url, {
        params: {
            access_token: accessToken,
            fields: params
        }
    });
    return res.data;
}



module.exports = {
    exchangeCodeForShortToken,
    getCampaign,
    exchangeForLongAccessToken,
    getUserProfile,
    getAdAccounts
}