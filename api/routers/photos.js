// const Ramda = require('ramda');
const express = require('express');
const getMapsClient = require('../../libraries/get-maps-client');





const router = express.Router();
router.get('/', getPhoto);





async function getPhoto(req, res) {
  const { ref } = req.query;
  try {
    const mapsClient = await getMapsClient();
    const photoReply = await (
      mapsClient.placesPhoto({
        photoreference: ref,
        maxwidth: 1000,
        maxheight: 1000
      })
      .asPromise()
    );

    const imageDataBuffers = [];
    photoReply.on('data', data => imageDataBuffers.push(data));
    photoReply.on('end', () => {
      const imageDataBuffer = Buffer.concat(imageDataBuffers);
      res.set(photoReply.headers);
      res.send(imageDataBuffer);
    });
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}





module.exports = router;
