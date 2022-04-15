const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: {
        type: String,
        default: 'https://res.cloudinary.com/dwbefprlg/image/upload/v1649935892/FindMeHotel/no-picture-available-icon-1_tepquv.png'
    },
    filename: String
});

//virtual function seems to be stored in DB but its not, rather its just a function which uses already stored data and we can make any changes to it and pass it
//In this case we are changing a part of image url
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };  //during JSON.stringify it doesnt consider virtual properties thus this has been used

const HotelSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User' //objectid referenced to User object and thus at the time of populating it will import all the attributes of Review (username, email etc)
    },
    reviews: [                //list of reviews stored for a hotel 
        {
            type: Schema.Types.ObjectId,     //store the objecId 
            ref: 'Review'                   //objectid referenced to Review object and thus at the time of populating it will import all the attributes of Review
        }

    ]
}, opts);

//opts used to use virtual functions
HotelSchema.virtual('properties.popUpMarkup').get(function () {
    var img = 'https://res.cloudinary.com/dwbefprlg/image/upload/v1649935892/FindMeHotel/no-picture-available-icon-1_tepquv.png';
    if(this.images.length){
        img = `${this.images[0].url}`;
    }
    
    return `
    <strong><a href="/hotels/${this._id}">${this.title}</a><strong>
    <p>${this.location}</p><img src=${img} alt="" style="width: 15em; height: 10em;">`;
});


//since its a post middleware it will return doc after deleting it
HotelSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await Review.deleteMany({  //we can also use remove but then it will throw deprecation warning(ambiguous keyword)
            _id: {
                $in: doc.reviews       //we check hotel id to be in that doc.reviews that we deleted and we remove all 
            }
        })
    }
})

module.exports = mongoose.model('Hotels', HotelSchema);