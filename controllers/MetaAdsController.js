const MetaAdsModel = require('../models/MetaAdsModel');
const bizSdk = require('facebook-nodejs-business-sdk');
const { NotFoundError } = require('../middleware/error/httpErrors')
const AdAccount = bizSdk.AdAccount;
const Campaign = bizSdk.Campaign;
const User = bizSdk.User



const getCampaign = async (req, res, next) => {
    try {
        const userId = req.user?.id
        const Ads = await MetaAdsModel.findOne({
            userId
        });

        if (!Ads) throw new NotFoundError('No Campaign Found');
        bizSdk.FacebookAdsApi.init(Ads.accessToken);
        const user = new User(Ads.fbUserId);
        const adAccounts = await user.getAdAccounts();
        const campaignsData = []
        for (const acc of adAccounts) {
            const account = new AdAccount(acc.id);
            const campaigns = await account.getCampaigns([campaigns.Fields.id, Campaign.Fields.name]);
            campaignsData.push({ adAccount: acc.id, campaigns });
        }
        return res.status(200).json({
            status: true,
            campaignsData
        })
    }
    catch (error) {
        next(error)
    }
}



module.exports = { getCampaign }