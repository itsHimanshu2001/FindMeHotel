const express = require('express');
const router = express.Router({ mergeParams: true });
//using mergeParams now we will have access of params from other linked file as well  
const catchAsync = require('../utils/catchAsync');  //the catch try func to help pass the error to middleware if it arises
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');


//WARNING: since express router doesnt keep params together and take care it separatively the req.params.id will be empty and that can be managed by doing mergeParams: true
//since we have defined the prefix =>(hotels/:id/reviews) in app.js and id param cant be accessed from app.js and thus we need to use mergeParams
router.post('/', isLoggedIn , validateReview , catchAsync( reviews.createReview ));

router.delete('/:reviewId', isLoggedIn , isReviewAuthor, catchAsync( reviews.deleteReview ));

module.exports = router;