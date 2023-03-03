const express = require('express')
const router = express.Router()
const authController = require('../controllers/AuthControllers')
const loginLimiter = require('../middleware/loginLimiter')



router.route('/register').post(loginLimiter, authController.Register);

router.route('/login').post(loginLimiter, authController.Login);

router.route('/forgot-password').post(loginLimiter, authController.ForgotPassword)

router.route('/reset-password').post(loginLimiter, authController.ResetPassword)

router.route('/logout').post(authController.UserLogout);

router.route('/getUser').get(authController.getUser);

router.route('/getAllUsers').get(authController.getAllUsers);

router.route('/deletedUser').delete(authController.deletedUser);

router.route('/updateUser').put(authController.updatedUser);



module.exports = router

