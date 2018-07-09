const express = require('express');
const placesRouter = require('./routers/places');
const photosRouter = require('./routers/photos');
require('../libraries/configure-aws-sdk');




const router = express.Router();
router.use('/places', placesRouter);
router.use('/photos', photosRouter);




module.exports = router;
