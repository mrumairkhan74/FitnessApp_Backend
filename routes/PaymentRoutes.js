const express = require('express');

const { verifyAccessToken } = require('../middleware/verifyToken')
const { createPaymentIntent, stripeWebhook } = require('../controllers/PaymentController')

const router = express.Router();

router.post('/create-payment', verifyAccessToken, createPaymentIntent)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook)


module.exports = router