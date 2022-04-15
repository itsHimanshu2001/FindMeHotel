const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,                 //the description/review of hotel by a user
    rating: Number,                 //rating in number (from 1 to 5 stars)
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User' 
    }
    //objectid referenced to User object and thus at the time of populating it will import all the attributes of Review (username, email etc)
});


module.exports = mongoose.model("Review", reviewSchema);
