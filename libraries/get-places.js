const Maps = require('@google/maps');
const mapsAPIKey = require('../libraries/maps-api-key');

const mapsClient = Maps.createClient({
  key: mapsAPIKey,
  Promise: Promise
});

async function getPlaces(req, res) {
  const { latitude, longitude } = req.query;
  console.log(latitude, longitude);
  try {
    const reply = await (
      mapsClient.placesNearby({
        location: [latitude, longitude],
        radius: 5000
      })
      .asPromise()
    );

    const places = reply.json.results;
    res.send(places);
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}


module.exports = getPlaces;
