const Ramda = require('ramda');
const express = require('express');
const getMapsClient = require('../../libraries/get-maps-client');





const router = express.Router();
router.get('/', getPlaces);





async function getPlaces(req, res) {
  console.log('handling places request', req.query);
  const { latitude, longitude } = req.query;
  try {
    console.log('getting maps client');
    const mapsClient = await getMapsClient();
    console.log(mapsClient);
    const placesReply = await (
      mapsClient.placesNearby({
        location: [latitude, longitude],
        opennow: true,
        radius: 5000,
        type: 'bar'
      })
      .asPromise()
    );

    const places = await Promise.all(
      Ramda.map(
        async placeSummary => {
          const placeReply = await mapsClient.place({ placeid: placeSummary.place_id }).asPromise();
          return placeReply.json.result;
        },
        placesReply.json.results
      )
    );

    res.send(places);
  } catch (error) {
    console.log('error handing place request');
    console.log(error);
    res.status(500).end();
  }
}





module.exports = router;
