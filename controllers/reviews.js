const Hotel = require('../models/hotels');
const Review = require('../models/review'); 

module.exports.createReview = async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);  //extracting id from req sent thru URL and finding it
    const review = new Review({...req.body.review, author: req.user});  //req.body sent thru form whose action is pointing to this POST req and we extracting review out of it and making new Review object
    hotel.reviews.push(review);  //pushing new review into the reviews list in hotel
    await review.save();
    await hotel.save();
    req.flash('success','New review added!');
    res.redirect(`/hotels/${hotel._id}`);
}

module.exports.deleteReview =  async(req, res) => {
    const { id, reviewId } = req.params;
    Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })  //$pull removes the object in reviews which matches with the given reviewId
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Deleted the review!');
    res.redirect(`/hotels/${id}`);
}