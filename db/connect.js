const mongoose = require("mongoose");
require('dotenv').config();

const mongoAtlasUri = "mongodb+srv://folajimi:dDclgpNQ5Ia6HhSx@cluster0.o7z1otr.mongodb.net/?retryWrites=true&w=majority";

mongoose.set('strictQuery',false);
const connectDB = () => {
    return mongoose.connect(
        process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    ).then(result => {
        console.log("Connected to the MongoDB Database");
    }).catch( err => {
        console.log("Connection to MongoBD Database has failed", err.message )
    });
}


module.exports = connectDB;