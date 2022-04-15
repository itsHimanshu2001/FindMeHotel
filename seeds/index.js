const mongoose = require('mongoose');
const Hotel = require('../models/hotels');  //we backout one directory from seeds to outside and then call models/hotels.js
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');



mongoose.connect('mongodb://localhost:27017/find-hotel', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random()*array.length)];


const seedDB = async () => {
    await Hotel.deleteMany({});

    for(let i = 0; i < 300 ; i++){
        const  rand1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Hotel({
            author: '6252d6567bbdda62b7456080',
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vitae nibh convallis leo ullamcorper ornare vel et ex. Aliquam vel tellus quis nisl aliquet mattis. Proin porttitor lacus mi, laoreet sodales justo ornare in.',
            price,
            geometry: {
                type: "Point",
                coordinates: [cities[rand1000].longitude, cities[rand1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                },
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                }
            ]

        })
        await camp.save();
        
    }
}

seedDB();