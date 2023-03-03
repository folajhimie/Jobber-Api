const User = require('../models/User');
const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");
const Token = require('../models/Token')
const sendEmail = require('../utils/sendMail')
const bcrypt = require('bcrypt')

require('dotenv').config();

var readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
        if (err) {
            callback(err);
            throw err;
        } else {
            callback(null, html)
        }
    })
}



const Register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({
                status: false,
                message: 'Empty Input Fields'
            })
        }

        var regExName = /^[a-zA-Z ]*$/;

        if (!regExName.test(username)) {
            return res.status(400).json({
                status: false,
                message: "Invalid username Entered!!"
            })
        }

        if (!/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(email)) {
            return res.status(400).json({
                status: false,
                message: "Invalid email Entered!!"
            })
        }

        if (password.length < 5) {
            return res.status(400).json({
                status: false,
                message: "Password is too Short!!"
            })
        }

        const existingUser = await User.findOne({ email }).exec();

        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: "User Already Exist!!"
            })
        }

        
        try {
            let newUser = await User.create({ username, email, password })

            console.log("the email service...", newUser);
            // let welcome = path.join(__dirname, "..", "views", "welcome.html");

            // readHTMLFile(welcome, async function (err, html) {
            //     var template = handlebars.compile(html);
            //     var replacements = {
            //         username: newUser.username,
            //         email: newUser.email,
            //     };
            //     var htmlToSend = template(replacements);
            //     await transporter.sendMail({
            //         from: process.env.EMAIL_USERNAME,
            //         to: newUser.email,
            //         subject: "Welcome Onboard!",

            //         html: htmlToSend,
            //     });

            // });

            const currentUrl = "http://localhost:4545/auth";

            const message = `
            <div style="width: 100%; background-color: #f3f9ff; padding: 5rem 0">
                <div style="max-width: 700px; background-color: white; margin: 0 auto">
                    <div style="width: 100%; background-color: #00efbc; padding: 20px 0">                
                        <div style="display: flex; justify-content: center; width: 100%; margin-top: 0.75rem;">
                            
                            <div
                            style="margin: 0.25rem; width:30px; height:30px"
                            >        
                            </div>
        
                            <span style="background-color: transparent; margin-top: 0.75rem; margin-right: 1.75rem; position: relative; bottom: 1.50rem; left: 1rem;">
                            </span>
                        </div>
                    </div>
        
        
                    <div style="width: 100% padding: 30px 0; display: flex; justify-content: center; flex-direction: column; align-items: center;">
                        <div style="font-size: .8rem; margin: 0 30px">
                            <p style="font-weight: 800; font-size: 1.2rem; padding: 0 0px">
                            Jobber 
                            </p>
                            <h2 style="font-size: 1rem; font-weight: 500;">Dear ${newUser.username}!</h2>
                            <p style="font-size: 1rem; font-weight: 500;">We are excited to have you on Jobber website.</p>
                            <p style="font-size: 1rem; font-weight: 500;">Press <a href=${currentUrl + "/login"}> here</a> to proceed.</p>
                
                            <p style="font-size: 1rem; font-weight: 500;">This OTP Code would expire in 30 minutes.</p>
                                
                            <p style="font-size: 1rem; font-weight: 500;">if you did not request a password reset. no further action is required</p>
                    
                            <p style="font-size: 1rem; font-weight: 500;">Regards...</p>
                            <p style="font-size: 1rem; font-weight: 500;">Jobber</p>
                            <div
                            style="height: 40px; background-color: gainsboro; width: 100%; margin-top: 50px; margin-bottom: 20px; border-radius: 0px 0px 20px 20px;"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            `;

            const subject = "Welcome on Board!";
            const send_to = newUser.email;
            // const sent_from = process.env.MAIL_USERNAME;
            const sent_from = `Jobber Organization 🏬 <${process.env.MAIL_USERNAME}>`;

            console.log("what is ur mail..", send_to, "what is your email address to be sent...", sent_from);

            try {
                await sendEmail(subject, message, send_to, sent_from);
                console.log("otp sent to the mailer...");
                const token = newUser.getJwtToken();
    
                const options = {
                    path: "/",
                    expires: new Date(
                        Date.now() + 1000 * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                };
    
                return res
                    .status(200)
                    .cookie("token", token, options)
                    .json({
                        status: true,
                        message: "user created",
                        newUser,
                        token
                    });
            } catch (error) {
                console.log("error in the Life..", error);
                res.status(500);
                throw new Error("Email not sent, please try again");
            }



        } catch (error) {
            res.status(500).json({
                status: "Failed",
                message: "An Error occured while saving user Account.."
            })
        }

    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
        })
    }



}

const Login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: false,
            message: "Please provide all input values."
        })
    }

    const user = await User.findOne({ email }).exec();


    console.log("object 1", email, password, user);


    if (!user) {
        return res.status(400).json({
            status: false,
            message: "User doesn't exist."
        })
    }

    // console.log("object 2", user);

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
        return res.status(400).json({
            status: false,
            message: "Password is Incorrect."
        })
    }

    console.log("object 3", isPasswordCorrect);
    try {
        if (user && isPasswordCorrect) {
            const token = user.getJwtToken();

            console.log('token to the access..', token);

            const options = {
                httpOnly: true, //accessible only by web server 
                secure: true, //https
                sameSite: 'None', //cross-site cookie 
                maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
            };

            console.log("refresh Token is the way forward..", token);

            // console.log("accessing the Token..", accessToken);

            return res
                .status(200)
                .cookie("token", token, options)
                .json({
                    status: true,
                    message: "User successfully Login",
                    user,
                    token
                });
        }



        console.log("object 4");
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

const UserLogout = async (req, res) => {

    if (!req.cookies?.jwt) {
        return res.status(204).json({ message: " No Cookie in Existence" })
    }

    const refreshToken = req.cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken }).exec();

    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);
    const result = await foundUser.save();
    console.log("Logged Out User", result);

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    res.status(204).json({ message: "User successfully Logged Out" });

}


const getAllUsers = async (req, res) => {
    const users = await User.find();

    if (!users || users.length < 0) {
        return res.status(400).json({
            status: false,
            message: "Users not Founds"
        })
    }

    if (users) {
        return res.status(200).json({
            status: true,
            message: "All Users Found!!",
            users
        })
    }
}

const getUser = async (req, res) => {
    const userId = req.params.id

    // const userId = req.body._id;
    // const userId = req.user._id;
    console.log("request for user..", req.user);

    try {
        const getUser = await User.findById(userId)
        return res.status(200).json({
            status: true,
            message: "User Found!!",
            getUser
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        })
    }
}


const updatedUser = async (req, res) => {
    const { username, email, location, roles, active } = req.body;

    if (!username || !email || !location || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({
            status: false,
            message: "All fields except password are required",
        })
    }

    const user = await User.findOne({ email }).exec();

    if (!user) {
        return res.status(400).json({
            status: true,
            message: "User not Found!!",
        })
    };

    try {
        if (user) {
            user.email = email;
            user.username = username;
            user.location = location;
            user.roles = roles;
            user.active = active;

            const updatedUser = await user.save();

            return res.status(400).json({
                status: true,
                message: `${updatedUser.username} profile has been updated`,
                updatedUser
            })
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        })
    }
}


const deletedUser = async (req, res) => {
    // const userId = req.params.id;

    // const userId = req.body._id;
    const userId = req.user._id;

    console.log("request for user..", req.user);

    if (!userId) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    // Does the user exist to delete?
    const user = await User.findById(userId).exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }
    try {
        if (user) {
            const deleteUser = await user.deleteOne();

            return res.status(200).json({
                status: true,
                message: `${deleteUser.username} with ID ${deleteUser._id} has been deleted`,
                deleteUser
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        })
    }

}

const ForgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).exec();

    if (!user) {
        return res
            .status(404)
            .json({
                status: false,
                message: "This User doesn't Exist!"
            });
    }

    const tokenCode = await Token.findOne({ userId: user._id }).exec();

    console.log("token in th code..", tokenCode);

    if (user && !tokenCode ) {
        // Creating a new Token
        var resetCode;
        resetCode = Math.floor(1000 + Math.random() * 9000).toString();

        console.log("token code created...", resetCode);

        const newToken = new Token({
            userId: user._id,
            username: user.username,
            code: resetCode,
            createdAt: Date.now(),
            expiredAt: Date.now() + 30 * (60 * 1000),
        });


        var savedToken = await newToken.save();

        // const { expiredAt } = newToken;

        // if (expiredAt > Date.now()) {
        //     var resetCodeAgain;
        //     resetCodeAgain = Math.floor(1000 + Math.random() * 9000).toString();
    
        //     console.log("token forgotten..", resetCode);
    
        //     const newToken = new Token({
        //         userId: user._id,
        //         username: user.username,
        //         code: resetCodeAgain,
        //         createdAt: Date.now(),
        //         expiredAt: Date.now() + 30 * (60 * 1000),
        //     });
    
    
        //     savedToken = await newToken.save(); 
        // }



        const currentUrl = "http://localhost:4545/auth";

        const message = `
            <div style="width: 100%; background-color: #f3f9ff; padding: 5rem 0">
                <div style="max-width: 700px; background-color: white; margin: 0 auto">
                    <div style="width: 100%; background-color: #00efbc; padding: 20px 0">                
                        <div style="display: flex; justify-content: center; width: 100%; margin-top: 0.75rem;">
                            
                            <div
                            style="margin: 0.25rem; width:30px; height:30px"
                            >        
                            </div>
        
                            <span style="background-color: transparent; margin-top: 0.75rem; margin-right: 1.75rem; position: relative; bottom: 1.50rem; left: 1rem;">
                            </span>
                        </div>
                    </div>
        
        
                    <div style="width: 100% padding: 30px 0; display: flex; justify-content: center; flex-direction: column; align-items: center;">
                        <div style="font-size: .8rem; margin: 0 30px">
                            <p style="font-weight: 800; font-size: 1.2rem; padding: 0 0px">
                            Jobber 
                            </p>
                            <h2 style="font-size: 1rem; font-weight: 500;">Dear ${user.username}!</h2>
                            <p style="font-size: 1rem; font-weight: 500;">We are excited to have you on Jobber website.</p>
                            <p style="font-size: 1rem; font-weight: 500;">Press <a href=${currentUrl + "/reset-password"}> here</a> to proceed.</p>
                
                            <p style="font-size: 1rem; font-weight: 500;">This OTP Code would expire in 30 minutes.</p>
                            <p style="font-size: 1rem; font-weight: 500;">And your reset code is <b>${resetCode}</b>.</p>  
                            <p style="font-size: 1rem; font-weight: 500;">if you did not request a password reset. no further action is required</p>
                    
                            <p style="font-size: 1rem; font-weight: 500;">Regards...</p>
                            <p style="font-size: 1rem; font-weight: 500;">Jobber</p>
                            <div
                            style="height: 40px; background-color: gainsboro; width: 100%; margin-top: 50px; margin-bottom: 20px; border-radius: 0px 0px 20px 20px;"
                            ></div>
                        </div>
        
        
                        <div style="font-size: .8rem; margin: 0 0px; display: flex; justify-content: center; flex-direction: column; align-items: center;">
                            <div style="font-weight: 800; font-size: 1.2rem; padding: 0 0px; display: flex;">
                            <p style="margin-right: 20px; font-size: 1rem; padding: 0 0px; font-weight: 500;">About Us</p>
                            <p style="margin-right: 20px; font-size: 1rem; padding: 0 0px; font-weight: 500;">Pricing</p>  
                            <p style="margin-right: 20px; font-size: 1rem; padding: 0 0px; font-weight: 500;">Company</p>
                            </div>
                            <div style="font-weight: 800; font-size: 1.2rem; padding: 0 0px; display: flex;">
                            <p style="margin-right: 20px; font-size: 1rem; padding: 0 0px; font-weight: 500;">Terms and Conditions</p>
                            <p style="margin-right: 20px; font-size: 1rem; padding: 0 0px; font-weight: 500;">All rights reserved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const subject = "OTP Email Resent";
        const send_to = user.email;
        // const sent_from = process.env.MAIL_USERNAME;
        const sent_from = `Jobber Organization 🏬 <${process.env.MAIL_USERNAME}>`;

        console.log("what is ur mail..", send_to, "what is your email address to be sent...", sent_from);

        try {
            await sendEmail(subject, message, send_to, sent_from);
            console.log("otp sent to the mailer...");
            return res
                .status(200)
                .json({
                    status: true,
                    message: "OTP Code Sent",
                    code: savedToken?.code,
                    data: savedToken,
                });
        } catch (error) {
            console.log("error in the Life..", error);
            res.status(500);
            throw new Error("Email not sent, please try again");
        }

    } 
    else {

        if (tokenCode) {
            const { expiredAt, userId } = tokenCode;

            var resetCode;
            resetCode = Math.floor(1000 + Math.random() * 9000).toString();

            if (expiredAt < Date.now()) {
                await tokenCode.updateOne({ code: resetCode }).exec();

                // const savedToken = await newToken.save();

                console.log("object Token in the code..", expiredAt, "listen..", userId);


                const currentUrl = "http://localhost:4545/auth";



                // let file = path.join(__dirname, "..", "views", "index.html");
                let customer = path.join(__dirname, "..", "views", "customer.html");

                console.log("customer of life..");

                readHTMLFile(customer, async function (err, html) {
                    var template = handlebars.compile(html);
                    var replacements = {
                        username: user.username,
                        current_Url: currentUrl,
                        reset_code: resetCode,
                    };
                    var htmlToSend = template(replacements);
                    var message = htmlToSend;

                    console.log("email worked...", customer);

                    const subject = "OTP Email Regenerated";
                    const send_to = user.email;
                    const sent_from = `Jobber Organization 🏬 <${process.env.MAIL_USERNAME}>`;

                    // console.log(send_to, sent_from);
                    console.log("what is ur Jobber Organization..", send_to, "what is your email address...", sent_from);

                    try {
                        await sendEmail(subject, message, send_to, sent_from);
                        console.log("otp sent to the mailer...");
                        return res
                            .status(200)
                            .json({
                                status: true,
                                message: "OTP Code Regenerated",
                                code: resetCode,
                                data: tokenCode,
                            });
                    } catch (error) {
                        console.log("error in the Life..", error);
                        res.status(500);
                        throw new Error("Email not sent, please try again");
                    }
                });

            }
        }
    }
}


const ResetPassword = async (req, res) => {
    const { password, confirmPassword, code } = req.body
    
    
    const tokenCode = await Token.findOne({ code: code }).exec();

    if (!tokenCode) {
        return res.status(400).json({
            status: false,
            message: "Code doesn't Match!",
        });
    }

    console.log("original Token..", tokenCode);

    const userCode = await User.findOne({ _id: tokenCode.userId })
    console.log("user for the way...", userCode)

     

    if (!code) {
        return res.status(400).json({
            status: false,
            message: "Please Enter your code!",
        });
    }

    if (!userCode) {
        return res.status(400).json({
            status: false,
            message: "Can't Find user!",
        });
    }

    if (!password || !confirmPassword) {
        return res.status(400).json({
            status: false,
            message: "Please input password Info!",
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            status: false,
            message: "Password don't match",
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("objecting...", hashedPassword);

        // Save new password
        if (userCode && hashedPassword) {
            console.log("user..", hashedPassword);
            userCode.password = hashedPassword;
            userCode.confirmPassword = password;
            await userCode.save();
            return res.status(200).json({
                status: true,
                message: "Password change successful",
                data: password
            });
        } else {
            res.status(400);
            throw new Error("password doesnt exist!");
        }
    } catch (error) {
        console.log("message error", error)
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }

}


module.exports = { ResetPassword, Register, Login, getAllUsers, getUser, updatedUser, deletedUser, UserLogout, ForgotPassword }