const express = require('express')
const router = express.Router()
const jobController = require('../controllers/JobControllers')
// const loginLimiter = require('../middleware/loginLimiter')

router.route('/addJob').post(jobController.createJob);

router.route('/allJobs').get(jobController.getAllJobs);

router.route('/showStatus').get(jobController.showStatus);

router.route('/deleteJob/:id').delete(jobController.deleteJob);

router.route('/updateJob/:id').put(jobController.updateJob);

module.exports = router

