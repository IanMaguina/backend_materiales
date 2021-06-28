const util = require('util');
const config = require('../../config');
const gc = require('./storage');
const bucket = gc.bucket(config.gcpCloudStorage.bucket);

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

 const uploadImage = (file) => new Promise((resolve, reject) => {
    const { originalname, buffer } = file
  
    const blob = bucket.file(originalname.replace(/ /g, "_"))
    const blobStream = blob.createWriteStream({
      resumable: false
    })
  
    blobStream.on('finish', () => {
      const publicUrl = util.format(
        `https://storage.cloud.google.com/${bucket.name}/${blob.name}`+`?authuser=1`
      )
      resolve(publicUrl)
    })
    .on('error', () => {
      reject(`Unable to upload image, something went wrong`)
    })
    .end(buffer)
  
  })
  
module.exports = uploadImage;