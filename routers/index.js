const express = require('express');
const router = express.Router();
const fs = require('fs');
const ytdl = require('ytdl-core');
const axios = require('axios');
const ytdlAudio = require('youtube-dl-exec');
const ffmpeg = require('ffmpeg');
const nodemailer = require('nodemailer');
const UserContact = require('../model/UserContact');
const ejs = require('ejs');
const path = require('path');
// Set YTDL_NO_UPDATE to disable update check for all uses of ytdl-core
process.env.YTDL_NO_UPDATE = '1';


// Convert YouTube video to audio using youtube-audio-downloader
const convertToAudio = async (videoUrl, quality) => {
  const audio = await ytdlAudio(videoUrl, {
    dumpSingleJson: true,
    noWarnings: true,
    noCallHome: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true,
    referer: 'https://www.youtube.com'
  });

  const audioUrl = audio.formats.find(format => format.ext === 'm4a' && format.acodec !== 'none' && format.abr === quality)?.url;

  if (!audioUrl) {
    throw new Error('No audio found at the specified quality');
  }
  return audioUrl;
};





router.get('/', async (req, res) => {
  const audioFiles = req.query.audioFiles ? JSON.parse(req.query.audioFiles) : [];
  return res.render('index' ,{
    title: 'YouTube to MP3 Converter | Youtube Converter',
    audioFiles,
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




// _---------_ Audio Converter


// router.post('/convert-audio', (req, res) => {
//   try{
//     const { url , quality } = req.body;

//     // Validate YouTube video URL
//     if (!ytdl.validateURL(url)) {
//       return res.render('index', {
//         audioFiles:req.query.audioFiles ? JSON.parse(req.query.audioFiles) : [] ,
//         title: 'YouTube to MP3 Converter | Youtube Converter',
//         message: 'Invalid YouTube URL.'
//       });
//     }

//     // Get info about YouTube video
//     ytdl.getInfo(url, (err, info) => {
//     if (err) {
//       console.error(err);
//       return res.render('index', {
//         audioFiles:req.query.audioFiles ? JSON.parse(req.query.audioFiles) : [],
//         title: 'YouTube to MP3 Converter | Youtube Converter',
//         message: 'Error fetching YouTube video info.'
//       });
//     }

//     // Filter out only audio streams of specified quality
//     const audioStreams = info.formats.filter(format => {
//       return format.type.startsWith('audio/mp4') && format.audioBitrate === quality;
//     });

//     // Choose the first audio stream (highest quality) and convert to MP3
//     const audioStream = audioStreams[0];
//     const videoTitle = info.videoDetails.title.replace(/[^\w]/g, '');
//     const outputFilePath = `public/audio/${videoTitle}.mp3`;

//     ffmpeg()
//       .input(ytdl(url, {
//         quality: audioStream.itag
//       }))
//       .audioBitrate(audioStream.audioBitrate)
//       .output(outputFilePath)
//       .on('end', () => {
//         console.log('Audio conversion complete');
//         const audioFile = { filename: `${videoTitle}.mp3` };

//         // Redirect to index page with audio files array
//         return res.redirect('/?audioFiles=' + encodeURIComponent(JSON.stringify([audioFile])));
//       })
//       .on('error', (err) => {
//         console.error(err.message,'Error On Binding ');
//         return res.redirect('back');
//       })
//       .run();
//     });
//   }catch(error){
//     console.log('An error occurred: ' + err.message);
//     return res.render('index', {
//       audioFiles: req.query.audioFiles ? JSON.parse(req.query.audioFiles) : [],
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: 'An error occurred while processing the video.'
//     });
//   }
// });



// router.get('/download-audio', (req, res) => {
//   try{
//     const filename = req.query.filename;
//     const filePath = path.join(__dirname, 'public', 'audio', filename);

//     // Set response headers for file download
//     res.setHeader('Content-disposition', `attachment; filename=${filename}`);
//     res.setHeader('Content-type', 'audio/mpeg');

//     // Stream the file to response object
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);
//   }catch(error){
//     console.log('An error occurred: ' + err.message);
//     return res.render('index', {
//       audioFiles: req.query.audioFiles ? JSON.parse(req.query.audioFiles) : [],
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: 'An error occurred while processing the video.'
//     });
//   }
// });


router.post('/convert-audio', async (req, res) => {
  try{
    const { url, quality } = req.body;
    const audioUrl = await convertToAudio(url, quality);

    // Generate a random filename for the audio file
    const filename = Math.random().toString(36).substring(7) + '.mp3';
    const filepath = path.join(__dirname, 'public', 'audio', filename);

    const writeStream = fs.createWriteStream(filepath);
    const audioStream = await axios({
      method: 'GET',
      url: audioUrl,
      responseType: 'stream'
    });

    audioStream.data.pipe(writeStream);
    audioStream.data.on('end', () => {
      // Redirect to the homepage with the list of converted audio files
      res.redirect('/?audioFiles=' + encodeURIComponent(JSON.stringify([{filename: filename}])));
    });
  }catch(error){
    console.log('An error occurred: ' + error.message);
    return res.render('index', {
      audioFiles: req.query.audioFiles ? JSON.parse(req.query.audioFiles) : [],
      title: 'YouTube to MP3 Converter | Youtube Converter',
      message: 'An error occurred while processing the video.'
    });
  }
});



router.get('/download-audio', (req, res) => {
  try{
    const filename = req.query.filename;
    const filepath = path.join(__dirname, 'public', 'audio', filename);

    res.download(filepath);
  }catch(error){
    console.log('An error occurred: ' + error.message);
    return res.render('index', {
      audioFiles: req.query.audioFiles ? JSON.parse(req.query.audioFiles) : [],
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
      to: [newMessage.email ,'smartds2550@gmail.com'],
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
