const express = require('express');
const router = express.Router();
const Hotel = require('../models/hotels');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async (req,res) => {
    const hotels = await Hotel.find({})
    res.render('hotels/index', {hotels});  //we are sending hotels/index.js as response which is file stored in hotels directory
}

module.exports.renderNewForm = (req,res) => {   //if we keep this afer id one then it will treat "new" as an ID
    res.render('hotels/new');  //takes us to add hotels page
}

module.exports.createHotel = async (req, res, next) => {
    //we passed the location and its returning me [longitude,latitude] stored in geoData.body.features[0].geometry
    const geoData = await geocoder.forwardGeocode({
        query: req.body.hotel.location,
        limit: 1
    }).send()

    // if(!req.body.hotel) throw new ExpressError('Invalid Hotel data', 400);
    const hotel = new Hotel(req.body.hotel);
    hotel.geometry = geoData.body.features[0].geometry;
    hotel.images = req.files.map(f => ({ url: f.path, filename: f.filename })); //multer allows us to parse cludinary data and we can get that using req.files
    // console.log(req.user); offered by passport     //hotels.author will store the id
    hotel.author = req.user._id;  
    await hotel.save();
    req.flash('success', 'Successfully added a new hotel!');  //it will flash a message just after saving the hotel date in db
    res.redirect(`hotels/${hotel._id}`)
}

module.exports.showHotel = async(req,res) => {
    const hotel = await Hotel.findById(req.params.id).populate({
        path: 'reviews',   //populating reviews
        populate: {        //nested populate : author in reviews
            path: 'author'
        }
    }).populate('author');
    // console.log(hotel); //all data
    if(!hotel){
        req.flash('error', 'Oops! Cannot find that hotel!');
        return res.redirect('/hotels'); 
    }
    res.render('hotels/show', { hotel });
}

module.exports.renderEditForm = async(req,res) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if(!hotel){
        req.flash('error', 'Oops! Cannot find that hotel!');
        return res.redirect('/hotels'); 
    }
    //(isAuthor's work)only authorised user can use the edit page (handles request from postman and other internal req)
    res.render('hotels/edit', { hotel });
}

module.exports.updateHotel = async (req,res) => {
    const { id } = req.params;
    //(isAuthor)only authorised user can edit (handles request from postman and other internal req)
    // console.log(req.body);  //we r going inside hotel to get the parameters in hotel
    const hotel = await Hotel.findByIdAndUpdate(id,req.body.hotel); 
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); //array of newaly added images
    hotel.images.push(...imgs);   //destructure the array to get each img objects and push it
    await hotel.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await hotel.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated the hotel information!');
    res.redirect(`/hotels/${hotel._id}`);
}

module.exports.deleteHotel = async (req, res) => {
    const { id } = req.params;
    //(isAuthor)only authorised user can delete (handles request from postman and other internal req)
    await Hotel.findByIdAndDelete(id);
    req.flash('success','Successfully deleted the hotel!');
    res.redirect('/hotels');
}