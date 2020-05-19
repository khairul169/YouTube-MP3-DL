const os = require('os');
const http = require('http');
const fs = require('fs');

/**
 * Get temporary directory path
 */
const getTempPath = () => os.platform() === "win32" ? "C:/Windows/Temp" : "/tmp";

/**
 * Download file from url
 * @param {string} url File url
 * @param {string} output Outpur directory
 */
const downloadFile = (url, output) => new Promise((resolve, reject) => {
  const file = fs.createWriteStream(output);

  http.get(url, (response) => {
    response.pipe(file);
  }).on('error', (err) => {
    fs.unlink(url);
    reject(err.message);
  });

  file.on('finish', () => {
    resolve();
    file.close();
  });
});

/**
 * Remove file
 * @param {string} path File path
 */
const removeFile = (path) => new Promise((resolve, reject) => {
  fs.unlink(path, (err) => {
    if (err) reject(err.message)
    else resolve();
  });
});

module.exports = {
  getTempPath,
  downloadFile,
  removeFile
}
