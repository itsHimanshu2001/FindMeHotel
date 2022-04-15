const express = require('express');
const router = express.Router();
const hotels = require('../controllers/hotels');
const catchAsync = require('../utils/catchAsync');   //we will go one step back because now we have shifited to a directory routes
const { isLoggedIn, validateHotel, isAuthor } = require('../middleware');

const Hotel = require('../models/hotels');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get( catchAsync( hotels.index ))
    .post(isLoggedIn, upload.array('image'), validateHotel, catchAsync( hotels.createHotel ))
    

//we have defined a middleware which will check if the user is loggedin or not, then only allow him to create new hotel
router.get('/new', isLoggedIn, hotels.renderNewForm );
 
router.route('/:id')
    .get( catchAsync( hotels.showHotel ))    //TO SHOW SPECIFIC HOTEL WE FIRST Search that hotel by ID and then return
    .put( isLoggedIn , isAuthor, upload.array('image'), validateHotel, catchAsync( hotels.updateHotel ))   //EDIT OPERATION on a specific hotel
    .delete( isLoggedIn , isAuthor , catchAsync( hotels.deleteHotel ))   //DELETE OPERATION

    //edit a particular hotel
router.get('/:id/edit', isLoggedIn, isAuthor ,catchAsync( hotels.renderEditForm ));


module.exports = router;   