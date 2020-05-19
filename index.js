const { YouTube } = require('popyt');
const YouTubeDL = require('./lib/YouTubeDL');

// Load config
require('dotenv').config();

const yt = new YouTube(process.env.YOUTUBE_APIKEY);

yt.getVideo('kano glow').then((value) => {
    console.log('id', value.id);
    console.log('title', value.title);
    console.log('thumb', value.thumbnails.standard.url);

    const dl = new YouTubeDL();
    dl.download(value.id).then((data) => {
        console.log(data);
    })
});


