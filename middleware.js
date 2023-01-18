const Hotel = require('./models/hotels');
const { userSchema, hotelSchema, reviewSchema } = require('./schemas.js'); 
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');

//it checks if user is not logged in then we will flash a message and redirect it back to login page
module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
        //i want to store the URL user is requesting 
        // console.log(req.path, req.originalUrl); //path will give me current path acc to router and latter will give me the absolute url so we require originalUrl
        req.session.returnTo = req.originalUrl;  //returnTo will help go to that previous requested URL before signing in
        req.flash('error', 'You must be logged in first!');
        return res.redirect('/login');
    }
    next();
}

//VALIDATION HOTEL FORM SECTION
//middleware to validate the info enetered in the form while creating new hotel
//and then it calls next and calls async func next in order
module.exports.validateHotel = (req, res, next) => {
    //in case any field is invalid we are dealing with it using joi 
    const { error } = hotelSchema.validate(req.body);   //console.log() to check in what structure it is giving us results and extract error out of it
    //if there is an error then since error : [[obj],[obj]] form so i am destructuring it to get all the errors using map
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
}

//VALIDATE UNAUTHORISED ACCESS TO EDIT PAGE
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/hotels/${id}`);
    }
    next();
}

//VALIDATE REVIEW SECTION
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);  
    // console.log(reviewSchema.validate(req.body));  //see what it contains
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
}

//first when we create new hotel and click on add hotel button, it first validate all the info entered thru a middleware (validateHotel)
//if error occurs there then it throws the error and doesnt contiue else it will call next() that will call next func waiting (catchAsync) that will save the info in db
//we can use next() until we require some function to run in chain.

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/hotels/${id}`);
    }
    next();
}

module.exports.isUser = async (req, res, next) => {
    const {error} = userSchema.validate(req.body);
     if(error){
        const msg = error.details.map(el => el.message).join(',')
        // throw new ExpressError(msg,400);
        res.status(400).json({
            status: 'error',
            message: msg,
        });
    }
    else{
        next();
    }
}