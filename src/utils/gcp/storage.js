const Cloud = require('@google-cloud/storage');
const config = require('../../config');

const { Storage } = Cloud;

const storage = new Storage({
    keyFilename: config.gcpCloudStorage.keyFilename,
    projectId: config.gcpCloudStorage.projectId
});

module.exports = storage;