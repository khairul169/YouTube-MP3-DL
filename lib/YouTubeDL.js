const Downloader = require('youtube-mp3-downloader');

class YouTubeDL {
  /**
   * Create youtube downloader instance
   */
  constructor() {
    // Downloader config
    this.config = {
      ffmpegPath: process.env.FFMPEG_PATH,
      outputPath: process.env.OUTPUT_DIR,
      youtubeVideoQuality: 'lowest',
      queueParallelism: 2,
      progressTimeout: 2000,
    };
  }

  /**
   * Download youtube video and convert to mp3
   * @param {string} videoId Video ID
   * @param {string | undefined} filename Output filename
   */
  download(videoId, filename = undefined) {
    // Create instance
    const ytDl = new Downloader(this.config);

    const promise = new Promise((resolve, reject) => {
      // Download video
      ytDl.download(videoId, filename);

      // Completed callback
      ytDl.on("finished", function (err, data) {
        resolve(data);
      });

      // Error callback
      ytDl.on("error", function (error) {
        reject(error);
      });
    });

    return promise;
  }
}

module.exports = YouTubeDL;
