const express = require('express');
const rateLimit = require('express-rate-limit')
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
const PaymentRoutes = require('./PaymentRoutes');
const IdlePeriodRoutes = require('./IdlePeriodRoutes');
const NotificationRoutes = require('./NotificationRoutes');

const router = express.Router();

const strictLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Too many attempts, try again later." },
    standardHeaders: true, // send rate limit info in headers
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: "Too many requests, slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});







router.use('/', strictLimiter, adminRoutes)
router.use('/staff', generalLimiter, StaffRoutes)
router.use('/member', generalLimiter, MemberRoutes)
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
router.use('/metaads', MetaAdsRoutes)
router.use('/payment', strictLimiter, PaymentRoutes)
router.use('/vacation', IdlePeriodRoutes)
router.use('/notification', NotificationRoutes)


module.exports = router