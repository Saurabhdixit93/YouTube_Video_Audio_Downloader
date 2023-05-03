const express = require('express');
const router = express.Router();
const fs = require('fs');
const ytdl = require('ytdl-core');
const nodemailer = require('nodemailer');
const UserContact = require('../model/UserContact');
const ejs = require('ejs');
const path = require('path');
// Set YTDL_NO_UPDATE to disable update check for all uses of ytdl-core
process.env.YTDL_NO_UPDATE = '1';
const ffmpegStatic = require('ffmpeg-static');
const { spawn } = require('child_process');


// Serve the index page
router.get('/', (req, res) => {
  return res.render('index',{
      title: 'YouTube to MP3 Converter | Youtube Converter',
       message: null,
       audioQualities: []
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

// for url routes and function-/ _---------_ Audio Converter--------------------------------------// route for downloading audio in different qualities

// router.get('/convert-audio', async (req, res) => {
//   try {
//     const videoUrl = req.query.url;
//     if(!ytdl.validateURL(videoUrl)){
//       return res.render('index',{
//         audioQualities: [],
//         title: 'Video Converter And Downloader | Youtube Converter',
//         message: 'Please Enter A Valid Youtube URL'
//       });
//     }
//     const audioFormats = await ytdl.getBasicInfo(videoUrl);
//     const audioQualities = audioFormats.formats.filter((format) => {
//       return format.mimeType.includes('audio/') && format.audioBitrate;
//     }).map((format) => {
//       return {
//         bitrate: format.audioBitrate,
//         mimeType: format.mimeType,
//         extension: format.container,
//         url: format.url,
//       };
//     });

//     return res.render('index', { 
//       audioQualities:audioQualities ,
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: "Converted Successfull"
//     });
//   } catch (error) {
//     console.error(error ,"ERROR IN VIDEO CONVERT TO AUDIO");
//     return res.render('index' ,{
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: `ERROR :${error.message}` 
//     });
//   }
// });


// router.get('/download-audio', (req, res) => {
//   try{
//     const audioUrl = req.query.url;
//     if(!ytdl.validateURL(audioUrl)){
//       return res.render('index',{
//         audioQualities: null,
//         title: 'Video Converter And Downloader | Youtube Converter',
//         message: 'Please Enter A Valid Youtube URL'
//       });
//     }
//     const audioExtension = req.query.extension;
//     const audioQuality = req.query.quality;

//     res.header('Content-Disposition', `attachment; filename="audio.${audioExtension}"`);
//     res.header('Content-Type', `audio/${audioExtension}`);

//     const ffmpegProcess = spawn(ffmpegStatic, [
//       '-i', audioUrl,
//       '-vn',
//       '-f', 'mp3',
//       '-ab', audioQuality,
//       '-',
//     ]);

//     ffmpegProcess.stdout.pipe(res);

//   }catch(error){
//     console.error(error ,"ERROR IN Download Audio");
//     return res.render('index' ,{
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: `ERROR :${error.message}` 
//     });
//   }
// });


router.get('/convert-audio', (req, res) => {
  const url = req.query.url;
  const audioQualities = [];
  if(!ytdl.validateURL(url)){
      return res.render('index',{
        audioQualities: null,
        title: 'Video Converter And Downloader | Youtube Converter',
        message: 'Please Enter A Valid Youtube URL'
      });
    }
  // Get available audio formats
  ytdl.getInfo(url, (err, info) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred');
      return;
    }

    const formats = info.formats.filter((format) => format.hasAudio && format.container === 'mp4');

    // Extract audio from each format and add to array
    formats.forEach((format) => {
      const audio = {
        bitrate: format.audioBitrate,
        mimeType: format.mimeType,
        extension: format.audioEncoding,
        url: format.url,
      };

      audioQualities.push(audio);
    });

    // Convert the audio to mp3
    convertAudio(audioQualities[0].url, audioQualities[0].extension)
      .then(() => {
        console.log('Converted successfully');
        return res.render('index', { 
           audioQualities,
           title: 'YouTube to MP3 Converter | Youtube Converter',
           message:'SuccessFully Converted ',
        });
      })
      .catch((err) => {
          console.error(err);
          return res.render('index' ,{
          title: 'YouTube to MP3 Converter | Youtube Converter',
          message: `ERROR :${err.message}`,
          audioQualities: [] 
        });
      });
  });
  // Convert the audio to mp3 using ffmpeg
  function convertAudio(audioUrl, extension) {
    return new Promise((resolve, reject) => {
      const ffmpegProcess = spawn(ffmpegStatic, [
        '-i',
        audioUrl,
        '-vn',
        '-ar',
        '44100',
        '-ac',
        '2',
        '-b:a',
        '192k',
        -f,
        `${extension}`,
        `/audio/audio.${extension}`,
      ]);

      ffmpegProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      ffmpegProcess.stderr.on('data', (data) => {
         console.error(`stderr: ${data}`);
      });

      ffmpegProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        if (code === 0) {
          resolve();
        } else {
          reject(`child process exited with code ${code}`);
        }
      });
    });
  }
});

router.get('/download-audio', (req, res) => {
  const fileUrl = req.query.url;
  if(!ytdl.validateURL(fileUrl)){
    return res.render('index',{
      audioQualities: null,
      title: 'Video Converter And Downloader | Youtube Converter',
      message: 'Please Enter A Valid Youtube URL'
    });
  }
  const extension = req.query.extension;
  const fileName = `audio.${extension}`;
  const filePath = `/audio/${fileName}`;

  // Set headers for file download
  res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
  res.setHeader('Content-type',` audio/${extension}`);

  // Send file to client
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error(err);
      return res.render('index' ,{
        title: 'YouTube to MP3 Converter | Youtube Converter',
        message: `ERROR :${err.message}`,
        audioQualities: [] 
      });
    }
  });
});










  // _--_________________

  // Set up the POST request route to convert the YouTube link to video

router.post('/convert-video', async (req, res) => {
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
router.get('/download-video', async (req, res) => {
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
