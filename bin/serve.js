const Maps = require('@google/maps');
const mapsAPIKey = require('../libraries/maps-api-key');





main();
async function main() {
  const mapsClient = Maps.createClient({
    key: mapsAPIKey,
    Promise: Promise
  });

  const latLngSample = [42.515779, -71.039001];
  try {
    const reply = await (
      mapsClient.placesNearby({
        location: latLngSample,
        radius: 5000
      })
      .asPromise()
    );

    const place = reply.json.results[0];
    console.log(place);
  } catch (error) {
    console.log(error);
  }
}
