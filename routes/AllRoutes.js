const express = require('express')
const router = express.Router();
const adminRoutes = require('./AdminRoutes')
const StaffRoutes = require('./StaffRoutes');
const MemberRoutes = require('./MemberRoutes');
const AppointmentRoutes = require('./AppointmentRoutes');
const LeadRoutes = require('./LeadRoutes');
const RelationRoutes = require('./RelationRoutes');
const BookTrialRoutes = require('./BookTrailRoutes');
const StudioRoutes = require('./StudioRoutes');
const TaskRoutes = require('./TaskRoutes');
const ServiceRoutes = require('./ServiceRoutes');
const ProductRoutes = require('./ProductRoutes');
const ContractRoutes = require('./ContractRoutes');
const ChatRoutes = require('./ChatRoutes');
const MessageRoutes = require('./MessageRoutes');
const BlockedRoutes = require('./BlockedRoutes');
const MetaAdsRoutes = require('./MetaAdsRoutes');

router.use('/', adminRoutes)
router.use('/staff', StaffRoutes)
router.use('/member', MemberRoutes)
router.use('/appointment', AppointmentRoutes)
router.use('/lead', LeadRoutes)
router.use('/relation', RelationRoutes)
router.use('/book', BookTrialRoutes)
router.use('/studio', StudioRoutes)
router.use('/task', TaskRoutes)
router.use('/service', ServiceRoutes)
router.use('/product', ProductRoutes)
router.use('/contract', ContractRoutes)
router.use('/chat', ChatRoutes)
router.use('/message', MessageRoutes)
router.use('/block', BlockedRoutes)
router.use('/metaAds', MetaAdsRoutes)


module.exports = router