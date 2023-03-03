require('dotenv').config();
require('express-async-errors');

const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const { logEvents, logger } = require('./middleware/logger')
// const xss = require('xss-clean');

const corsOptions = {
    origin: ["http://localhost:7000", "http://localhost:4545"],
    credentials: true,

}
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(cookieParser());
app.use(helmet())
// app.use(xss())

app.use(express.json())
app.use(logger)
app.use(cors());

// app.use(
//     cors({
//       origin: ["http://localhost:7000", "http://localhost:4545"],
//       credentials: true,
//     })
// );

app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/v1/auth', require('./routes/authRoutes'))
app.use('/api/v1/jobs', require('./routes/jobRoutes'))
app.use('/api/v1/organization', require('./routes/orgRoutes'))


app.all('*', (req, res) =>{
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if(req.accepts('json')){
        res.json({ message: '404 Not Found'})
    }else {
        res.type('txt').send('404 Not Found')
    }
})



module.exports = app;