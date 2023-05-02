const express = require('express');
const mongoose = require('mongoose');
const ytdl  = require('ytdl-core');
const ffmpeg = require('ffmpeg');
const dotenv = require('dotenv');
dotenv.config();
const expressLayouts = require('express-ejs-layouts');
const port = 5000;
const app = express();
const fs = require('fs');
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

app.get('/ads.txt' ,(req,res) => {
    const filepath = __dirname + '/ads.txt';
    fs.readFile(filepath,'utf8',(err,data) =>{
        if(err){
            console.log('Error in txt FIle' , err);
        }
        else{
            return res.type('text/plain').send(data);
        }
    });
}); 

// Serve the index page
app.get('/', (req, res) => {
  return res.render('index',{
      title: 'YouTube to MP3 Converter | Youtube Converter',
       message: null,
       audioQualities: null
  });
});



app.use('/',require('./routers'));

ConnectDB().then(() => {
    app.listen(port,() => {
        console.log(`Congratulations Server Started in Port : ${port}`);
    });
});
