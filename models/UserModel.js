const mongoose = require('mongoose');
const db = require('../config/db');

const options = {
    discriminatorKey: 'role', // this will store 'user', 'member', or 'admin'
    collection: 'users',       // all types share the same collection
    timestamps: true
};

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        // required: true,
        minlength: 2,
        maxlength: 20
    },
    lastName: {
        type: String,
        // required: true,
        minlength: 2,
        maxlength: 20
    },
    username: {
        type: String,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9_]+$/.test(v);  // only letters, numbers, underscore
            },
            message: props => `${props.value} is not a valid username!`
        },
        unique: true,
        minlength: 5,
        maxlength: 20,
        lowercase: true
    },
    img: {
        url: String,
        public_id: String,
    },
    email: {
        type: String,
        // required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter valid email"]
    },
    password: {
        type: String,
        // required: true,
        minlength: 8,
        validate: {
            validator: function (v) {
                return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@.-_$!%*?&])[A-Za-z\d@$!.-_%*?&]{8,}$/.test(v);
            },
            message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
        }

    },
    refreshToken: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'male',
        // required: true,
    },
    dateOfBirth: {
        type: Date,
        // required: true,
    },
    city: {
        type: String,
        // required: true,
    },
    street: {
        type: String,
        // required: true,
    },
    phone: {
        type: String,
        validate: {
            validator: v => /^\d{10,15}$/.test(v),
            message: props => `${props.value} is not a valid phone number!`
        },
        // required: true,
    },
    zipCode: {
        type: String,
        validate: {
            validator: v => /^\d{4,10}$/.test(v),
            message: props => `${props.value} is not valid zip code!`
        },
        // required: true,
    },
    about: {
        type: String,
        // required: true,
    },
}, options);


UserSchema.index({ username: 1, email: 1, firstName: 1, lastName: 1, img: 1 })

const UserModel = mongoose.model('User', UserSchema);


module.exports = UserModel

