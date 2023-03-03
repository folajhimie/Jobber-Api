const mongoose = require('mongoose');
const validator = require('validator');


const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide Organization Name'],
        maxlength: 50,
        minlength: [3, 'Minimum Organization length is 3 characters'],
        trim: true
    },
    contact_name: { 
        type: String, 
        required: true, 
        maxLength: 100 
    },
    contact_email: {
        type: String,
        required: [true, 'Please provide an email'],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is Invalid')
            }
        },
        lowercase: [true, 'Please ensure your email should be in lowercase'],
        unique: true,
        trim: true,
    },
    address: {
        type: String,
        required: [true, 'Please provide Organization Address'],
        maxlength: 150,
        minlength: [3, 'Minimum Organization Address length is 3 characters'],
    },
    code: {
        type: String,
        required: true
    },
    image:{
        type: Object,
        required: true
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please Provide User']
    },
},
    {
        timestamps: true,
    }
)

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = Organization;