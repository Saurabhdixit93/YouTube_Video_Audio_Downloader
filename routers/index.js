const express = require('express');
const router = express.Router();
const fs = require('fs');
const ytdl = require('ytdl-core');
// const youtubedl = require('youtube-dl');
const nodemailer = require('nodemailer');
const UserContact = require('../model/UserContact');
const ejs = require('ejs');
const path = require('path');
// Set YTDL_NO_UPDATE to disable update check for all uses of ytdl-core
process.env.YTDL_NO_UPDATE = '1';



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
//     const audioFormats = await ytdl.getInfo(videoUrl);
//     console.log( 'Audio Formats',audioFormats.formats); // Add this line to see the audio formats fetched
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

//     console.log('Audio Quality', audioQualities); // Add this line to see the audio qualities generated

//     if (audioQualities.length === 0) {
//       return res.render('index', {
//         audioQualities: [],
//         title: 'YouTube to MP3 Converter | Youtube Converter',
//         message: 'No audio found for the given link.'
//       });
//     }

//     return res.render('index', { 
//       audioQualities: audioQualities,
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: "Converted successfully"
//     });
//   } catch (error) {
//     console.error(error ,"ERROR IN VIDEO CONVERT TO AUDIO");
//     return res.render('index' ,{
//       audioQualities: [],
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: `ERROR :${error.message}` 
//     });
//   }
// });


// router.get('/download-audio', async (req, res) => {
//   try{
//     const url = req.query.url;
//     const extension = req.query.extension;
//     const info = await ytdl.getInfo(url);
//     const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
//     const audio = audioFormats.find((format) => format.container === extension);
//     if (!audio) {
//       return res.render('index', {
//         audioQualities: [],
//         title: 'YouTube to MP3 Converter | Youtube Converter',
//         message: `Cannot find the requested format (${extension})`,
//       });
//     }
//     const audioStream = ytdl(url, {
//       quality: audio.itag,
//       filter: (format) => format.container === extension,
//     });
//     const title = info.videoDetails.title;
//     const fileName = `${title}.${extension}`;

//     res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
//     res.setHeader('Content-Type', `audio/${extension}`);
//     audioStream.pipe(res);

//   }catch(error){
//     console.error(error ,"ERROR IN Download Audio");
//     return res.render('index' ,{
//          audioQualities: [],
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: `ERROR :${error.message}` 
//     });
//   }
// });




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
    return res.render('index', {
      audioQualities: [],
      title: 'YouTube to MP3 Converter | Youtube Converter',
      message: `ERROR: ${error.message}`,
    });
  }
});


router.get('/download-audio', async (req, res) => {
  try {
    const videoUrl = req.query.url;
    const audioFormat = req.query.format;

    if (!ytdl.validateURL(videoUrl)) {
      return res.render('index', {
        audioQualities: [],
        title: 'Video Converter And Downloader | Youtube Converter',
        message: 'Please Enter A Valid Youtube URL',
      });
    }

    const audioStream = ytdl(videoUrl, ['--format=' + audioFormat]);

    const fileName = `audio.${audioFormat}`;
    res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    audioStream.pipe(res);
  } catch (error) {
    console.error(error, 'ERROR IN Download Audio');
    return res.render('index', {
      audioQualities: [],
      title: 'YouTube to MP3 Converter | Youtube Converter',
      message: `ERROR: ${error.message}`,
    });
  }
});


  // _--_________________

  // Set up the POST request route to convert the YouTube link to video

// router.post('/convert-video', async (req, res) => {
//   try{
//     const url = req.body.url;
//     if(!ytdl.validateURL(url)){
//       return res.render('VideoConverter',{
//         video: null,
//         title: 'Video Converter And Downloader | Youtube Converter',
//         message: 'Please Enter A Valid Youtube URL'
      
//       });
//     }
//     const info = await ytdl.getInfo(url);
//     const video = {
//       title: info.videoDetails.title,
//       url: url,
//       thumbnail: info.videoDetails.thumbnails[0].url,
//       // formats: info.formats.filter(format => format.container === 'mp4')
//       formats: videoFormats.map(format => {
//         return {
//           quality: format.qualityLabel,
//           itag: format.itag,
//           type: format.mimeType,
//           url: format.url,
//         };
//       })
//     };
//     return res.render('VideoConverter', { 
//       video: video,
//       title: 'Video Converter And Downloader | Youtube Converter',
//       message: 'Converted Successfully , Please Download'
//     });
//   }catch(error){
//     console.log('Error Video Converting:' ,error);
//     return res.render('VideoConverter', { 
//       video: null,
//       title: 'Video Converter And Downloader | Youtube Converter',
//       message: `'Error When Converting' ,${error.message}`
//     });
//   }
// });  // main without formats map


router.post('/convert-video', async (req, res) => {
  try{
      const url = req.body.url;
      if (!ytdl.validateURL(url)) {
        return res.render('VideoConverter', {
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

      const availableQualities = ["2160p", "1440p", "1080p", "720p", "480p", "360p"];
      const filteredFormats = [];
      availableQualities.forEach((quality) => {
        const format = video.formats.find(f => f.qualityLabel === quality);
        if (format) filteredFormats.push(format);
      });
      video.formats = filteredFormats;

      return res.render('VideoConverter', {
        video: video,
        title: 'Video Converter And Downloader | Youtube Converter',
        message: 'Converted Successfully in all available qualities, Please Download'
      });
    }catch(error){
      console.log('Error Video Converting:' ,error);
      return res.render('VideoConverter', { 
        video: null,
        title: 'Video Converter And Downloader | Youtube Converter',
        message: `'Error When Converting' ,${error.message}`
      });
    }
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
