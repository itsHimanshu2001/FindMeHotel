const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');


router.route('/register')
    .get( users.renderRegister)
    .post( catchAsync( users.register ))
//normal catchAsync middleware wont be able to catch exceptions where id already exists
//for that case i am using try and catch to flash it on the same window that the user already exists

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)
//passport provide us with an authenticate middleware which validate the username and password for us and incase fails it redirect us to /login and repsonds with flash

//passport provide us with logout option thru req so that we can logout out of the current session 
router.get('/logout', users.logout );

module.exports = router;