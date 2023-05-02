const express = require('express');
const router = express.Router();
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg');
const nodemailer = require('nodemailer');
const UserContact = require('../model/UserContact');
const ejs = require('ejs');
const path = require('path');
// Set YTDL_NO_UPDATE to disable update check for all uses of ytdl-core
process.env.YTDL_NO_UPDATE = '1';


router.get('/', async (req, res) => {
  let files = [];
  const dirPath = path.join(__dirname , 'public', 'audio');
  if(fs.existsSync(dirPath)){
    files = fs.readdirSync(dirPath);
  }
  if(files.length === 0){
    return res.render('index', {
      files: files,
      title: 'YouTube to MP3 Converter | Youtube Converter',
      message: 'No Converted File Found Please Convert !'
    });
  }
  return res.render('index' ,{
    title: 'YouTube to MP3 Converter | Youtube Converter',
    files,
    message: null
  });
});

router.get('/video-downloader', (req ,res) => {
  return res.render('VideoConverter',{
    title: 'Video Converter And Downloader | Youtube Converter',
    video: null,
    message: null
  });
});

router.get('/terms' ,async(req,res) => {
    return res.render('terms',{
        title: 'Terms and Conditions | Youtube Converter'
    });
});

router.get('/privacy' ,async(req,res) => {
    return res.render('privacy-policy',{
      title: 'Privacy And Policies | Youtube Converter'
    });
});

router.get('/about-us', (req,res) => {
  return res.render('AboutUs',{
    title: 'About Us | Youtube Converter'
  });
});
router.get('/contact-us', (req,res) => {
  return res.render('ContactUs',{
    title: 'Contact Us | Youtube Converter',
    message: null
  });
});

// for url routes and function---------------------------------------// route for downloading audio in different qualities

// for url routes and function---------------------------------------// route for downloading audio in different qualities

router.post('/convert-to-audio', async (req, res) => {
    

  const { url } = req.body;
  if (!ytdl.validateURL(url)) {
    return res.render('index', {
      files: [],
      title: 'YouTube to MP3 Converter | Youtube Converter',
      message: 'Invalid YouTube URL.'
    });
  }
  const info = await ytdl.getInfo(url);
  const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
  const formats = ytdl.filterFormats(info.formats, 'audioonly');
  const tasks = [];
  formats.forEach(format => {
    const filePath = path.join(__dirname, 'public', 'audio', `${title}_${format.audioBitrate}kbps.mp3`);
    tasks.push(new Promise((resolve, reject) => {
      ffmpeg(ytdl(url, { format }))
        .audioBitrate(format.audioBitrate)
        .save(filePath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
    }));
  });
  try {
    await Promise.all(tasks);
    res.redirect('/');
  } catch (err) {
    console.log('An error occurred: ' + err.message);
    return res.render('index', {
      files: null,
      title: 'YouTube to MP3 Converter | Youtube Converter',
      message: 'An error occurred while processing the video.'
    });
  }
});

router.get('/:file', (req, res) => {
  try{
    const filePath = path.join(__dirname, 'public', 'audio', req.params.file);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      return res.render('index', {
        files: filePath,
        title: 'YouTube to MP3 Converter | Youtube Converter',
        message: 'File Not Found.'
      });
    }
  }catch(error){
    console.log('An error occurred: ' + err.message);
    return res.render('index', {
      files: [],
      title: 'YouTube to MP3 Converter | Youtube Converter',
      message: 'An error occurred while processing the video.'
    });
  }
});

  // _--_________________

  // Set up the POST request route to convert the YouTube link to video

router.post('/download', async (req, res) => {
  const url = req.body.url;
  if(!ytdl.validateURL(url)){
    return res.render('VideoConverter',{
      video: null,
      title: 'Video Converter And Downloader | Youtube Converter',
      message: 'Please Enter A Valid Youtube URL'
    
    });
  }
  const info = await ytdl.getInfo(url);
  const video = {
    title: info.videoDetails.title,
    url: url,
    thumbnail: info.videoDetails.thumbnails[0].url,
    formats: info.formats.filter(format => format.container === 'mp4')
  };
  return res.render('VideoConverter', { 
    video: video,
    title: 'Video Converter And Downloader | Youtube Converter',
    message: 'Converted Successfully , Please Download'
  });
});



// Set up the GET request route to download the selected video format
router.get('/download', async (req, res) => {
  try{
    const url = req.query.url;
    const format = req.query.format;
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title;
    const videoFileName = `${videoTitle}.${format}`;
    const videoStream = ytdl(url, { format: format });
    const contentDispositionHeader = `attachment; filename*=UTF-8''${encodeURIComponent(videoFileName)}`;
    res.setHeader('Content-Disposition', contentDispositionHeader);
    res.setHeader('Content-Type', 'video/mp4');
    videoStream.pipe(res);
  }catch(error){
    return res.render('VideoConverter', { 
      video: null,
      title: 'Video Converter And Downloader | Youtube Converter',
      message: `'Error When Downloading' ,${error.message}`
    });
  }
});


// email template load from viewfiles for password reset
const successEmail = fs.readFileSync('./project_views/ContactSuccess/SuccessEmail.ejs','utf-8');

// Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT, 
  auth: {
    user:process.env.SMTP_USER_EMAIL,
    pass:process.env.SMTP_USER_PASSWORD
  },
  secure: process.env.SECURE_SMTP,
});

// form submition 

router.post('/send-contact-form' ,async (req , res) => {
  try{

    const { name , email , message } = req.body;
    const isMessage = await UserContact.findOne({message});
    if(isMessage){
      return res.render('ContactUs', {
        title: 'Contact Us | Youtube Converter',
        message: 'This Message Already Sent ,Send New Message Please.'
      });
    }
    const newMessage = await new UserContact({
      name,
      email,
      message
    });
    await newMessage.save();
    const renderedTemplate = ejs.render(successEmail,{ newMessage });
    // Construct the password reset email
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL ,
      to: newMessage.email,
      subject: `Contact Submitted Successfull`,
      html: renderedTemplate,
    };
    // Send the email
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.render('ContactUs', {
          title: 'Contact Us | Youtube Converter',
          message: 'There was an Error Please Try Again.'
        });
      } else {
        return res.render('ContactUs', {
          title: 'Contact Us | Youtube Converter',
          message: 'Successfully Submitted Contact Form.'
        });
      }
    });
  }catch(error){
    console.log('An error occurred: ' + error.message);
    return res.render('ContactUs', {
      title: 'Contact Us | Youtube Converter',
      message: 'An error occurred while Submitting Contact Form.'
    });
  }
});


module.exports = router;
