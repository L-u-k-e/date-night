const fs = require('fs');

const defaultMapsAPIKeyFilePath = '/run/secrets/maps-api-key';
const path = process.env.MAPS_API_KEY_FILE_PATH || defaultMapsAPIKeyFilePath;
const apiKey = fs.readFileSync(path, 'utf8').trim();

module.exports = apiKey;
