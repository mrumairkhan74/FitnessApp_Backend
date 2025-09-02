const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const ContractModel = require('../models/ContractModel')
const PaymentModel = require('../models/PaymentModel')
const { MemberModel } = require('../models/Discriminators');
const { NotFoundError } = require('../middleware/error/httpErrors');
const { nextDay } = require('date-fns');


const getOrCreateCustomer = async (member) => {
    if (member.stripeCustomerId) return member.stripeCustomerId;
    const customer = await stripe.customers.create({
        email: member.email,
        name: `${member.firstName} ${member.lastName}`
    });
    member.stripeCustomerId = customer.id;
    await member.save();
    return customer.id;
}

const createPaymentIntent = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        const { contractId, amount } = req.body;

        const member = await MemberModel.findById(userId);
        if (!member) throw new NotFoundError("Invalid Member id");

        const contract = await ContractModel.findById(contractId);
        if (!contract || contract.member.toString() !== userId) throw new NotFoundError('Contract Not Found');

        const customerId = await getOrCreateCustomer(member);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'eur',
            payment_method_types: ['sepa_debit'],
            description: `payment for Contract ${contractId}`,
            setup_future_usage: 'off_session'
        });

        const payment = await PaymentModel.create({
            contract: contract._id,
            member: member._id,
            stripePaymentIntentId: paymentIntent.id,
            amount,
            status: 'pending'
        });

        return res.status(200).json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
        next(error)
    }
}


const stripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        const paymentIntent = event.data.object;

        const payment = await PaymentModel.findOne({ stripePaymentIntentId: paymentIntent.id });
        if (!payment) throw new NotFoundError('Payment not Found');

        if (event.type === 'payment_intent_succeeded') {
            payment.status = 'paid',
                payment.paidAt = new Date()
        } else if (event.type === 'payment_intent_failed') {
            payment.status = 'failed'
        }
        await payment.save();
        res.status(200).send({ received: true })


    }
    catch (error) {
        next(error)
    }
}

module.exports = {
    stripeWebhook,
    createPaymentIntent
}