const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide name'],
        maxlength: 20,
        minlength: [3, 'Minimum firstname length is 6 characters'],
        trim: true
    },
    email: {
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
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password should not contain word: password')
            }
        },
        minlength: [6, 'Minimum password length is 4 characters'],
        select: true,
        trim: true
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please provide a password'],
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password should not contain word: password')
            }
        },
        minlength: [6, 'Minimum password length is 4 characters'],
        select: true,
        trim: true
    },
    location: {
        type: String,
        trim: true,
        maxlength: 20,
        default: 'My City'
    },
    roles: {
        type: [String],
        default: ["Employee"]
    },
    isAdmin: { 
        type: Boolean, 
        default: false 
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
},
    {
        timestamps: true,
    }
)

userSchema.pre('save', async function() {
    if(!this.isModified('password')) return 

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})


// jwt token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
};

userSchema.methods.comparePassword = async function (candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}

const User = mongoose.model('User', userSchema);

module.exports = User;