const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, 'Please provide Company Name'],
        maxlength: 50,
        minlength: [3, 'Minimum Company length is 3 characters'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Please provide Position'],
        maxlength: 100,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Interview', 'Declined', 'Pending'],
        default: 'Pending',
    },
    jobType: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Remote', 'Internship'],
    },
    jobLocation: {
        type: String,
        default: 'My City',
        required: true,
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


const Job = mongoose.model('Job', JobSchema);

module.exports = Job;