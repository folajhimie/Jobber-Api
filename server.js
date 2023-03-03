const app = require('./app');
const connectDB = require('./db/connect');
const PORT = process.env.PORT || 4500;

require('dotenv').config();



const start = async() => {
    try{
        await connectDB();
        console.log('DB connected successfully...')
        app.listen(process.env.PORT, ()=> {
            console.log(`Server is listening on port ${process.env.PORT}`); 
        })
    }catch(error){
        console.log("error has occured", error.message);
    }
}


start();