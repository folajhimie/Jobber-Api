const jwt = require('jsonwebtoken')
require('dotenv').config();




const auth = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.authorization;

    if (!authHeader?.startsWith('Bearer') || !authHeader) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const token = authHeader.split(' ')[1]

    try {
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            (error, decoded) => {
                if (error) {
                    return res.status(401).json({ message: 'Token is not valid' });
                } else {
                    req.user = decoded;
                    next();
                }
            }
        )
    } catch (err) {
        console.error('something wrong with auth middleware', err);
        res.status(500).json({ message: 'Server Error' });
    }

}

// For Admin
const isAdmin = (req, res, next) => {
    auth(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            res.status(403).send("Access denied. Not authorized...");
        }
    });
};


module.exports = { auth, isAdmin };































