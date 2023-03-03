const nodemailer = require('nodemailer');
// const { v4: uuidv4 } = require('uuid');
// const User = require('../models/User');
require('dotenv').config();




const sendMail = async (subject, message, send_to, sent_from, reply_to) => {

    
    var transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        // service : process.env.EMAIL_SERVICE,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth : {
            user : process.env.EMAIL_USERNAME,
            pass : process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Option for sending email
    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        html: message,
    };

    // send email
    await transporter.sendMail(options, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log("Email Sent!");
        }
    });

    // verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log("Server is ready to take our messages");
        }
    });


}

module.exports = sendMail;