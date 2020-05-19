const YouTubeDL = require('ytdl-core');
const Ffmpeg = require('fluent-ffmpeg');
const { getTempPath, downloadFile } = require('./Utils');

class YTAudioStream {
  /**
   * Create youtube audio downloader instance
   */
  constructor(quality = false) {
    this.highQuality = quality;
    this.outStream = null;
  }

  /**
   * Stream audio from youtube
   * @param {string} videoId Video ID
   * @returns {Promise} Return promise of video info
   */
  stream(videoId) {
    const url = 'http://www.youtube.com/watch?v=' + videoId;

    // Promise resolver
    let resolver;
    let rejector;

    // ytdl stream
    const stream = YouTubeDL(url, {
      quality: this.highQuality ? 'highestaudio' : 'lowestaudio',
      filter: 'audioonly',
    });

    stream.on('error', (err) => {
      rejector && rejector(err.message);
    });

    // On video info received
    stream.on('info', async (info, format) => {
      const { title, lengthSeconds, thumbnail, author } = info.player_response.videoDetails;

      // Video thumbnail
      let thumbUrl = thumbnail.thumbnails[thumbnail.thumbnails.length - 1].url;
      if (thumbUrl) {
        thumbUrl = thumbUrl.replace(/^https:\/\//i, 'http://');
      }

      // Video info
      const videoInfo = {
        title: title,
        length: parseInt(lengthSeconds, 10),
        thumbnail: thumbUrl,
        author: author
      };

      //const thumbPath = getTempPath() + `/${videoId}.jpg`;
      //await downloadFile(thumbUrl, thumbPath);

      // Convert audio
      this.outStream = Ffmpeg(stream)
        .setFfmpegPath(process.env.FFMPEG_PATH)
        .audioCodec('libmp3lame')
        .outputOptions(
          '-id3v2_version', '3',
          '-metadata', 'title=' + title,
          '-metadata', 'artist=' + (author || 'Unknown'),
        )
        .format('mp3');

      this.outStream.on('error', (err) => {
        rejector && rejector(err.message);
      });

      // Resolve result
      resolver && resolver(videoInfo);
    });

    return new Promise((resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    });
  }

  pipe(stream) {
    if (this.outStream) {
      this.outStream.pipe(stream, { end: true });
    }
  }
}

module.exports = YTAudioStream;
