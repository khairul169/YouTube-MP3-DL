const { YouTube } = require('popyt');
const YTAudioStream = require('./lib/YTAudioStream');
const express = require('express');
const slugify = require('slugify');
const app = express();

// Load config
require('dotenv').config();

app.get('/', (req, res) => {
  res.send('YouTube Mp3 Streaming');
});

app.get('/search/:query', async (req, res) => {
  const { query } = req.params;
  const yt = new YouTube(process.env.YOUTUBE_APIKEY);

  try {
    // Search video
    const videoList = await yt.searchVideos(query, 10);

    // Map result
    const result = videoList.results.map((video) => {
      const { id, title, thumbnails } = video;
      const thumbnail = thumbnails.high ? thumbnails.high.url : thumbnails.default.url;

      return { id, title, thumbnail, thumbnails };
    });

    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ error: true }).status(500);
  }
});

app.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Download audio
    const ytStream = new YTAudioStream();
    const info = await ytStream.stream(id);

    // Set http header
    const filename = slugify(`${info.title}.mp3`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send response
    ytStream.pipe(res);
  } catch (err) {
    console.log(err);
    res.send(err).status(500);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started...');
});
