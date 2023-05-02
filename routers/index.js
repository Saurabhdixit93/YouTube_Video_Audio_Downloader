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

// router.get('/', async (req, res) => {
//   let files = [];
//   const dirPath = path.join(__dirname , 'public', 'audio');
//   if(fs.existsSync(dirPath)){
//     files = fs.readdirSync(dirPath);
//   }
//   if(files.length === 0){
//     return res.render('index', {
//       files: files,
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: 'No Converted File Found Please Convert !'
//     });
//   }
//   return res.render('index' ,{
//     title: 'YouTube to MP3 Converter | Youtube Converter',
//     files,
//     message: null
//   });
// });



// router.get('/', async (req, res) => {
  
//   const dirPath = path.join(__dirname , 'public', 'audio');
//   if(fs.existsSync(dirPath)){
//     audioFiles = fs.readdirSync(dirPath);
//   }
//   if(audioFiles.length === 0){
//     return res.render('index', {
//       audioFiles: audioFiles,
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: 'No Converted File Found Please Convert !'
//     });
//   }
//   return res.render('index' ,{
//     title: 'YouTube to MP3 Converter | Youtube Converter',
//     files,
//     message: null
//   });
// });

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

// for url routes and function---------------------------------------// route for downloading audio in different qualities

// router.post('/convert-to-audio', async (req, res) => {
    

//   const { url } = req.body;
//   if (!ytdl.validateURL(url)) {
//     return res.render('index', {
//       files: [],
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: 'Invalid YouTube URL.'
//     });
//   }
//   const info = await ytdl.getInfo(url);
//   const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
//   const formats = ytdl.filterFormats(info.formats, 'audioonly');
//   const tasks = [];
//   formats.forEach(format => {
//     const filePath = path.join(__dirname, 'public', 'audio', `${title}_${format.audioBitrate}kbps.mp3`);
//     tasks.push(new Promise((resolve, reject) => {
//       ffmpeg(ytdl(url, { format }))
//         .audioBitrate(format.audioBitrate)
//         .save(filePath)
//         .on('end', () => resolve())
//         .on('error', (err) => reject(err))
//     }));
//   });
//   try {
//     await Promise.all(tasks);
//     res.redirect('/');
//   } catch (err) {
//     console.log('An error occurred: ' + err.message);
//     return res.render('index', {
//       files: null,
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: 'An error occurred while processing the video.'
//     });
//   }
// });

// router.post('/convert-to-audio', async (req, res) => {
     
// try {
//   const { url } = req.body;
//   if (!ytdl.validateURL(url)) {
//     return res.render('index', {
//       files: [],
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: 'Invalid YouTube URL.'
//     });
//   }
//   const info = await ytdl.getInfo(url);
//   const formats = ytdl.filterFormats(info.formats, 'audioonly');

//   // Create an array to store the filenames
//   const files = [];

//   // Loop through each format and download the audio file
//   for (let i = 0; i < formats.length; i++) {
//     const format = formats[i];
//     const filename = `${info.videoDetails.title}_${format.audioBitrate}kbps.mp3`;
//     const filepath = `/public/audio/${filename}`;
//     const file = fs.createWriteStream(filepath);

//     // Use ytdl to download the audio file and pipe it to the file stream
//     const stream = ytdl(url, { filter: 'audioonly'});
//     stream.pipe(file);

//     // Wait for the download to finish before pushing the filename to the array
//     await new Promise(resolve => {
//       file.on('finish', () => {
//         file.close();
//         files.push(filename);
//         resolve();
//       });
//     });
//   }

//   // Render the EJS template with the list of converted files
//   return res.render('index', { 
//     files: files || [] ,
//     title: 'YouTube to MP3 Converter | Youtube Converter',
//     message: `Converted Successfully, Please Download`
//   });
 
//   } catch (err) {
//     let files = [];
//     const dirPath = path.join(__dirname , 'public', 'audio');
//     if(fs.existsSync(dirPath)){
//       files = fs.readdirSync(dirPath);
//     }
//     console.log('An error occurred: ' + err.message);
//     return res.render('index', {
//       files,
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: `An error occurred while processing the video.${ err.message}`
//     });
//   }
// });

// router.get('/:file', (req, res) => {
//   try{
//     const filePath = path.join(__dirname, 'public', 'audio', req.params.file);
//     if (fs.existsSync(filePath)) {
//       res.download(filePath);
//     } else {
//       return res.render('index', {
//         files: filePath,
//         title: 'YouTube to MP3 Converter | Youtube Converter',
//         message: 'File Not Found.'
//       });
//     }
//   }catch(error){
//     console.log('An error occurred: ' + err.message);
//     return res.render('index', {
//       files: [],
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: 'An error occurred while processing the video.'
//     });
//   }
// });


// _---------_ Audio Converter


// router.post('/convert-audio', (req, res) => {
//   try{
//     const url = req.body.url;
//     const quality = req.body.quality;

//     // Validate YouTube video URL
//     if (!ytdl.validateURL(url)) {
//       return res.render('index', {
//         audioFiles,
//         title: 'YouTube to MP3 Converter | Youtube Converter',
//         message: 'Invalid YouTube URL.'
//       });
//     }

//     // Get info about YouTube video
//     ytdl.getInfo(url, (err, info) => {
//       if (err) {
//         console.error('Error In Find Info Of Link', err);
//         return res.render('index', {
//           audioFiles,
//           title: 'YouTube to MP3 Converter | Youtube Converter',
//           message: 'Invalid YouTube URL.'
//         });
//       }

//       // Filter out only audio streams of specified quality
//       const audioStreams = info.formats.filter(format => {
//         return format.type.startsWith('audio/mp4') && format.audioBitrate === quality;
//       });

//       // Choose the first audio stream (highest quality) and convert to MP3
//       const audioStream = audioStreams[0];
//       const videoTitle = info.player_response.videoDetails.title;
//       const videoId = info.player_response.videoDetails.videoId;
//       const outputFilePath = `public/audio/${videoTitle}.mp3`;
      
//       ffmpeg(ytdl(url, {
//         quality: audioStream.itag
//       }))
//         .audioBitrate(audioStream.audioBitrate)
//         .save(outputFilePath)
//         .on('end', () => {
//           console.log('Audio conversion complete');
//           const audioFile = { filename: `${videoTitle}.mp3` };
//           audioFiles.push(audioFile);
//           // Redirect to index page with audio files array
//           return res.redirect('/?audioFiles=' + encodeURIComponent(JSON.stringify(audioFiles)));
//         })
//         .on('error', (err) => {
//           console.error(err+ 'Errror In OnBinding');
//           return res.render('index', {
//             audioFiles,
//             title: 'YouTube to MP3 Converter | Youtube Converter',
//             message: 'Internal Server Error.'
//           });
//         });
//     });
//   }catch(error){
//     console.log('An error occurred: ' + err.message);
//     return res.render('index', {
//       audioFiles,
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: 'An error occurred while processing the video.'
//     });
//   }
// });


// // For Download Audio 

// router.get('/download-audio', (req, res) => {
//   try{
//     const filename = req.query.filename;
//     const filePath = `public/audio/${filename}`;

//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       console.log('Audio file not found');
//       return res.redirect('/');
//     }

//     // Stream the file to the client for download
//     const fileStream = fs.createReadStream(filePath);
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//     fileStream.pipe(res);
//   }catch(error){
//     console.log('An error occurred: ' + err.message);
//     return res.render('index', {
//       audioFiles,
//       title: 'YouTube to MP3 Converter | Youtube Converter',
//       message: 'An error occurred while processing the video.'
//     });
//   }
// });


router.post('/convert-audio', (req, res) => {
  try{
    const { url , quality } = req.body;

    // Validate YouTube video URL
    if (!ytdl.validateURL(url)) {
      return res.render('index', {
        audioFiles:req.query.audioFiles ? JSON.parse(req.query.audioFiles) : [] ,
        title: 'YouTube to MP3 Converter | Youtube Converter',
        message: 'Invalid YouTube URL.'
      });
    }

    // Get info about YouTube video
    ytdl.getInfo(url, (err, info) => {
    if (err) {
      console.error(err);
      return res.render('index', {
        audioFiles:req.query.audioFiles ? JSON.parse(req.query.audioFiles) : [],
        title: 'YouTube to MP3 Converter | Youtube Converter',
        message: 'Error fetching YouTube video info.'
      });
    }

    // Filter out only audio streams of specified quality
    const audioStreams = info.formats.filter(format => {
      return format.type.startsWith('audio/mp4') && format.audioBitrate === quality;
    });

    // Choose the first audio stream (highest quality) and convert to MP3
    const audioStream = audioStreams[0];
    const videoTitle = info.videoDetails.title.replace(/[^\w]/g, '');
    const outputFilePath = `public/audio/${videoTitle}.mp3`;

    ffmpeg()
      .input(ytdl(url, {
        quality: audioStream.itag
      }))
      .audioBitrate(audioStream.audioBitrate)
      .output(outputFilePath)
      .on('end', () => {
        console.log('Audio conversion complete');
        const audioFile = { filename: `${videoTitle}.mp3` };

        // Redirect to index page with audio files array
        return res.redirect('/?audioFiles=' + encodeURIComponent(JSON.stringify([audioFile])));
      })
      .on('error', (err) => {
        console.error(err.message,'Error On Binding ');
        return res.redirect('back');
      })
      .run();
    });
  }catch(error){
    console.log('An error occurred: ' + err.message);
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
    const filePath = path.join(__dirname, 'public', 'audio', filename);

    // Set response headers for file download
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'audio/mpeg');

    // Stream the file to response object
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }catch(error){
    console.log('An error occurred: ' + err.message);
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
