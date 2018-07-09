const Maps = require('@google/maps');
const AWS = require('aws-sdk');





module.exports = getMapsClient;





let mapsClient = null;
async function getMapsClient() {
  if (!mapsClient) {
    await initializeMapsClient();
  }
  return mapsClient;
}

async function initializeMapsClient() {
  const mapsAPIKey = await getMapsAPIKey();
  mapsClient = Maps.createClient({
    key: mapsAPIKey,
    Promise: Promise
  });
}

async function getMapsAPIKey() {
  const ssm = new AWS.SSM();
  const ssmParameterResponse = await ssm.getParameter({ Name: 'maps_api_key', WithDecryption: true }).promise();
  const mapsAPIkey = ssmParameterResponse.Parameter.Value;
  return mapsAPIkey;
}
