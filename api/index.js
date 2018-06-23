const express = require('express');
const placesRouter = require('./routers/places');
const photosRouter = require('./routers/photos');





const router = express.Router();
router.use('/places', placesRouter);
router.use('/photos', photosRouter);




module.exports = router;
