const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    
    email: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true,
    },

    address: {
        type: String,
        required: true,
    },

    mobileNumber: {
        type: String,
        required: true,
    },

    dob: {
        type: Date,
        required: true,
    },
});
//we just define email like and this when we add plugin like below then it automatically adds username, passwords and other static methods like authenticate() etc.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);