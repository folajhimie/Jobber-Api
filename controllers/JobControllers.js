const Job = require('../models/Job');
const mongoose = require('mongoose');
const moment = require('moment');
const checkPermission = require('../utils/checkPermissions')






const getAllJobs = async (req, res) => {
    const { page, limit, search, status, jobTypes, sort } = req.query;
    const queryObject = { createdBy: req.user._id }

    //searching 
    if (status !== 'all') {
        queryObject.status = status;
    }

    if (status !== 'all') {
        queryObject.jobTypes = jobTypes;
    }

    if (status !== 'all') {
        queryObject.status = status;
    }

    if (search) {
        queryObject.position = { $regex: search, $options: 'i' }
    }

    let result = await Job.find(queryObject);

    //sorting 
    if (sort === 'latest') {
        result = result.sort('-createdAt')
    }
    if (sort === 'oldest') {
        result = result.sort('createdAt')
    }
    if (sort === 'a-z') {
        result = result.sort('position')
    }
    if (sort === 'z-a') {
        result = result.sort('-position')
    }

    // Pagination

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    result = result.skip(skip).limit(limitNumber);

    const jobs = await result;
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / limitNumber);

    return res.status(200).json({
        status: true,
        message: "All Job sent",
        jobs, 
        totalJobs,
        numOfPages
    })

}



const createJob  = async(req, res) => {
    const { position, company, jobLocation, status } = req.body;

    if (!position || !company || !jobLocation || !status ) {
        return res.status(400).json({
            status: false,
            message: 'Please provide all values'
        })
    }

    const jobs = await Job.findAll();

    console.log("All Job for the Comapny..", jobs);

    if (jobs.position === position &&
        jobs.company === company &&
        jobs.jobLocation === jobLocation) 
    {
        return res.status(400).json({
            status: false,
            message: 'Job already exist'
        })
    }

    req.body.createdBy = req.user._id;

    const job = await Job.create(req.body)

    return res.status(200).json({
        status: true,
        message: "successfully Created Job",
        job
    }) 
}


const updateJob = async(req, res) => {
    const { id: jobId } = req.params;
    const { company, position } = req.body;

    if (!position || !company) {
        return res.status(400).json({
            status: false,
            message: 'Please provide all values'
        })
    }

    const job = await Job.findOne({_id: jobId}).exec();

    if (!job) {
        return res.status(400).json({
            status: false,
            message: `No job with id: ${jobId}`,
        })
    }

    checkPermission(req.user, job.createdBy);

    const updateJob = await Job.findOneAndUpdate({_id: jobId}, req.body, { new:true, runValidators: true })

    return res.status(200).json({
        status: true,
        message: "successfully Updated Job",
        updateJob
    }) 
}


const showStatus = async(req, res) => {
    let stats = await Job.aggregate([
        { $match : { createdBy : mongoose.Types.ObjectId(req.user._id)} },
        { $group : { _id : '$status', count : { $sum : 1 } } }
    ])

    console.log("let see the total..", stats);

    stats = stats.reduce((acc, curr) => {
        const {_id: title, count } = curr 
        acc[title] = count
        return acc 
    }, {})

    console.log("advanced Object...", stats);

    const defaultStats = {
        pending: stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0,
    }

    let monthlyApplications = await Job.aggregate([
        { $match : { createdBy : mongoose.Types.ObjectId(req.user._id)} },
        { 
            $group : { 
                _id : {
                    year: { $year: 'createdAt'},
                    month: { $month: 'createdAt'},
                }, 
                count : { $sum : 1 } 
            } 
        },
        { $sort : { '_id.year' : -1, '_id.month' : -1 } },
        { $limit : 10 }
    ])

    monthlyApplications = monthlyApplications.map((item) => {
        const { _id: { year , month }, count } = item;
        const date = moment().month(month - 1).year(year).format('MMM Y')
        return { date, count }
    }).reverse();

    return res.status(200).json({
        status: true,
        message: "Status Displayed",
        defaultStats, 
        monthlyApplications,
        stats
    })
}

const deleteJob = async(req, res) => {
    // const jobId = req.params;
    const jobId = req.body._id;

    const job = await Job.findOne({ _id: jobId}).exec();

    if (!job) {
        return res.status(400).json({
            status: false,
            message: "Job Not Found!",
        })
    }
    checkPermission(req.user, job.createdBy)

    const deleteJob = await job.findOneAndDelete({ jobId})

    console.log("was it deleted..", deleteJob);

    return res.status(200).json({
        status: true, 
        message: `This job with id: ${jobId} was successfully Deleted.`
    })

}

module.exports = { getAllJobs, showStatus, updateJob, createJob, deleteJob }