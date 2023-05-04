const express = require('express');
const router = express.Router();
const fs = require('fs');
const ytdl = require('ytdl-core');
const nodemailer = require('nodemailer');
const UserContact = require('../model/UserContact');
const ejs = require('ejs');
// const request = require('request');
//Set YTDL_NO_UPDATE to disable update check for all uses of ytdl-core
process.env.YTDL_NO_UPDATE = '1';


//Serve the index page
router.get('/', (req, res) => {
  return res.render('index',{
      title: 'YouTube to MP3 Converter | Youtube Converter',
       message: null,
       audioQualities: []
  });
});

//for vdeo page
router.get('/video-downloader', (req ,res) => {
  return res.render('VideoConverter',{
    title: 'Video Converter And Downloader | Youtube Converter',
    video: null,
    message: null
  });
});

//terms page
router.get('/terms' ,async(req,res) => {
    return res.render('terms',{
        title: 'Terms and Conditions | Youtube Converter'
    });
});

//privacy page
router.get('/privacy' ,async(req,res) => {
    return res.render('privacy-policy',{
      title: 'Privacy And Policies | Youtube Converter'
    });
});

//About Us Page
router.get('/about-us', (req,res) => {
  return res.render('AboutUs',{
    title: 'About Us | Youtube Converter'
  });
});

//Contact Us Page
router.get('/contact-us', (req,res) => {
  return res.render('ContactUs',{
    title: 'Contact Us | Youtube Converter',
    message: null
  });
});

// for url routes and function-/ _---------_ Audio Converter--------------------------------------// route for downloading audio in different qualities


//Routes for Audio Converter
router.get('/convert-audio', async (req, res) => {
  try {
    const videoUrl = req.query.url;
    if (!ytdl.validateURL(videoUrl)) {
      return res.render('index', {
        audioQualities: [],
        title: 'Video Converter And Downloader | Youtube Converter',
        message: 'Please Enter A Valid Youtube URL',
      });
    }
    const audioFormats = await ytdl.getInfo(videoUrl);
    console.log('Audio Formats', audioFormats.formats); // Add this line to see the audio formats fetched
    const audioQualities = audioFormats.formats
      .filter((format) => {
        return format.mimeType.includes('audio/') && format.audioBitrate;
      })
      .map((format) => {
        return {
          bitrate: format.audioBitrate,
          mimeType: format.mimeType,
          extension: format.ext,
          url: format.url,
        };
      });

    console.log('Audio Quality', audioQualities); // Add this line to see the audio qualities generated

    if (audioQualities.length === 0) {
      return res.render('index', {
        audioQualities: [],
        title: 'YouTube to MP3 Converter | Youtube Converter',
        message: 'No audio found for the given link.',
      });
    }

    return res.render('index', {
      audioQualities: audioQualities,
      title: 'YouTube to MP3 Converter | Youtube Converter',
      message: 'Converted successfully',
    });
  } catch (error) {
    console.error(error, 'ERROR IN VIDEO CONVERT TO AUDIO');
    return res.render('PageNotFound' ,{
      title: 'Page Not Found | 404 ',
      message: `Oops! Error:${error.message}` 
    });
  }
});

// const https = require('https');
// const url = require('url');


// function downloadAudio(audioUrl) {
//   return new Promise((resolve, reject) => {
//     const urlParts = url.parse(audioUrl, true);
//     const format = urlParts.query.format;

//     https.get(audioUrl, (res) => {
//       if (res.statusCode !== 200) {
//         reject(new Error(`Failed to download audio with status code ${res.statusCode}`));
//         return;
//       }

//       const chunks = [];
//       res.on('data', (chunk) => {
//         chunks.push(chunk);
//       });

//       res.on('end', () => {
//         const audioBuffer = Buffer.concat(chunks);
//         resolve({ format, audioBuffer });
//       });
//     }).on('error', (err) => {
//       reject(err);
//     });
//   });
// }
const axios = require('axios');

router.get('/download-audio' , async (req ,res) => {

  
  try{
  //   const headers = {
  //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  //     'Referer': 'https://www.youtube.com/'
  //   };
  //   const config = {
  //     headers,
  //     responseType: 'stream'
  // };
  // try {
  //   const response = await axios.get(url, config);
  //   const filename = `audio.${format}`;
  //   const path = `/public/audio/${filename}`;
  //   const writer = fs.createWriteStream(path);
  //   response.data.pipe(writer);
  //   writer.on('finish', () => {
  //     res.download(path, filename, (err) => {
  //       if (err) {
  //         console.log(`An error occurred while downloading the audio: ${err}`);
  //         return res.render('PageNotFound' ,{
  //           title: 'Page Not Found | 404 ',
  //           message: `An error occurred while downloading the audio: ${err.message}`
  //         });
  //       }
  //       fs.unlinkSync(path);
  //     });
    // });
    const { url } = req.query;
    axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    }).then(function(response) {
      const writer = fs.createWriteStream('audio.webm');
      response.data.pipe(writer);
      console.log('Audio downloaded successfully!');
      }).catch(function(error) {
        console.log(error);
        return res.render('PageNotFound' ,{
          title: 'Page Not Found | 404 ',
          message: `An error occurred while downloading the audio: ${error.message}`
        });
      });
  } catch (error) {
    console.log(`An error occurred while downloading the audio: ${error}`);
    return res.render('PageNotFound' ,{
      title: 'Page Not Found | 404 ',
      message: `An error occurred while downloading the audio: ${error.message}`
    });
  }
});






// //Audio Downloader Routes
// router.get('/download-audio', async (req, res) => {
//   // try {
//   //   const videoUrl = req.query.url;
//   //   const audioFormat = req.query.format;

//   //  // if (!ytdl.validateURL(videoUrl)) {
//   //    //return res.render('index', {
//   //      // audioQualities: [],
//   //      // title 'Video Converter And Downloader | Youtube Converter',
//   //     //  message: 'Please Enter A Valid Youtube URL',
//   //    // });//
//   //   //}
   

//   //   const audioStream = ytdl(videoUrl, ['--format=' + audioFormat]);

//   //   const fileName = `audio.${audioFormat}`;
//   //   res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
//   //   res.setHeader('Content-Type', 'audio/mpeg');

//   //   audioStream.pipe(res);
//   // } catch (error) {
//   //   console.error(error, 'ERROR IN Download Audio');
//   //   return res.render('PageNotFound' ,{
//   //     title: 'Page Not Found | 404 ',
//   //     message: `Oops! Error:${error.message}` 
//   //   });
//   // }
//    try{
//       const audioUrl = req.query.url;
//       const fileName = req.query.format;


//       const download = (url, dest, cb) => {
//         const file = fs.createWriteStream(dest);
//         const sendReq = request.get(url);

//         // verify response code
//         sendReq.on('response', (response) => {
//           if (response.statusCode !== 200) {
//             return cb('Response status was ' + response.statusCode);
//           }

//           sendReq.pipe(file);
//         });

//         // close the write stream
//         file.on('finish', () => {
//           file.close(cb);
//         });

//         // handle errors
//         sendReq.on('error', (err) => {
//           fs.unlink(dest);
//           return cb(err.message);
//         });

//         file.on('error', (err) => {
//           fs.unlink(dest);
//           return cb(err.message);
//         });
//       };

//     download(audioUrl, fileName, (err) => {
//       if (err) {
//         return res.render('PageNotFound' ,{
//           title: 'Page Not Found | 404 ',
//           message: `Oops! Error:${err.message}` 
//         });
//       }
      
//       res.download(fileName, (err) => {
//         if (err) {
//           fs.unlinkSync(fileName);
//           return res.render('PageNotFound' ,{
//             title: 'Page Not Found | 404 ',
//             message: `Oops! Error:${err.message}` 
//           });
//         }
//         fs.unlinkSync(fileName);
//       });
//     });
//    }catch(error){
//     console.error(error, 'ERROR IN Download Audio');
//     return res.render('PageNotFound' ,{
//       title: 'Page Not Found | 404 ',
//       message: `Oops! Error:${error.message}` 
//     });
//    }
// });


// _____________________ FOR VIDEO _________________________________

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
      console.log('Error In Download:', error);
      return res.render('PageNotFound' ,{
        title: 'Page Not Found | 404 ',
        message: `Oops! Error:${error.message}` 
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
        return res.render('PageNotFound' ,{
          title: 'Page Not Found | 404 ',
          message: `Oops! Error:${error.message}` 
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
    return res.render('PageNotFound' ,{
      title: 'Page Not Found | 404 ',
      message: `Oops! Error:${error.message}` 
    });
  }
});


module.exports = router;
