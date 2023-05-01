const express = require('express');
const mongoose = require('mongoose');
const ytdl  = require('ytdl-core');
const ffmpeg = require('ffmpeg');
const dotenv = require('dotenv');
dotenv.config();
const expressLayouts = require('express-ejs-layouts');
const port = 5000;
const app = express();
const nodemailer = require('nodemailer');
app.use(express.urlencoded({extended:true}));

// data base
const ConnectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/Youtube_Converter');
        console.log(`MongoDB connected  successfull : ${conn.connection.host}`);
    }catch(err){
        console.log(`Error In Connecting MongoDB: ${err}`);
        process.exit(1);
    }
};

app.use(express.static('public'));
app.use(expressLayouts);
app.set('view engine' , 'ejs');
app.set('views' , 'project_views');

app.use('/',require('./routers'));

ConnectDB().then(() => {
    app.listen(port,() => {
        console.log(`Congratulations Server Started in Port : ${port}`);
    });
});
