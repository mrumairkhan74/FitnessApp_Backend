const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    
    rateType: {
        type: String,
        enum: ['basic', 'premium', 'bronze'],
        default: 'basic',
        required: true,
    },
    // contractDetail
    billingPeriod: {
        type: String,
        enum: ['monthly', 'weekly', 'yearly'],
        default: 'monthly'
    },
    cost: {
        type: String,
    },
    duration: {
        type: String,
    },

    // Discount
    percentage: {
        type: Number,
    },
    billingPeriods: {
        type: Number
    },
    isPermanent: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No'
    },
    // studioDetail
    studioName: {
        type: String,
        required: true,

    },
    studioOwnerName: {
        type: String,
        required: true,
    },
    // firstName
    vorname: {
        type: String,
        required: true,
    },
    // lastName
    nachname: {
        type: String,
        required: true
    },
    // title
    anrede: {
        type: String
    },
    // street
    strasse: {
        type: String,
    },
    // houseNumber
    hausnummer: {
        type: String
    },
    // postalCode
    plz: {
        type: String
    },
    // city
    ort: {
        type: String
    },
    // phoneNo
    telefonnummer: {
        type: String
    },
    // mobile
    mobil: {
        type: Number
    },
    // emailAddress
    emailAdresse: {
        type: String,
        lowercase: true,
        required: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter valid email"]
    },
    // contract detail
    // contractDetails
    // plan minimumTerm
    tarifMindestlaufzeit: {
        type: String
    },
    // price Per week
    preisProWoche: {
        type: String
    },
    // starterBox
    startbox: {
        type: String
    },
    //Plan minimum Term
    mindestlaufzeit: {
        type: String
    },
    // ContractStartDate
    startDerMitgliedschaft: {
        type: Date,
    },
    // serviceStart
    startDesTrainings: {
        type: Date,
    },
    // contractExtensionPeriod
    vertragsverlaengerungsdauer: {
        type: String,
    },
    // noticePeriod
    kuendigungsfrist: {
        type: String,
    },


    // date/place and signature
    ort_datum_unterschrift: {
        type: String,
    },
    // sepa Details
    fullName: {
        type: String,
        required: true
    },
    // creditInstitution
    kreditinstitut: {
        type: String,
    },
    // BIC
    bic: {
        type: String,
        required: true
    },
    // ibanNumber
    iban: {
        type: String,
        required: true
    },
    // Sepa REfernece Number
    sepaMandate: {
        type: String,
    },

    // all document pdf save with contract detail 
    pdfUrl: {
        url: String,
        public_id: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "staff"
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead"
    }

})


contractSchema.index({ emailAdresse: 1, rateType: 1 })


const ContractModel = mongoose.model("Contract", contractSchema);

module.exports = ContractModel;