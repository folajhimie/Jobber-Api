const express = require('express')
const router = express.Router()
const organizationController = require('../controllers/OrganizationControllers')
// const loginLimiter = require('../middleware/loginLimiter')
const { isAdmin } = require('../middleware/auth')

router.route('/addOrg').post(isAdmin, organizationController.createOrganization);

router.route('/allOrg').get(isAdmin, organizationController.getOrganization);

router.route('/allOrg/:id').get(isAdmin, organizationController.getOrganizationId);

router.route('/showOrg').get(isAdmin, organizationController.showOrgStatus);

router.route('/deleteOrg/:id').delete(isAdmin, organizationController.deleteOrganization);

router.route('/updateOrg/:id').put(isAdmin, organizationController.updateOrganization);

module.exports = router


