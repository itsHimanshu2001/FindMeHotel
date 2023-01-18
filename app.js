if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const path = require('path');          //for setting view engine path or other paths
const mongoose = require('mongoose');  
const ejsMate = require('ejs-mate');       //for ejs
const methodOverride = require('method-override');   //for overriding post for put and delete
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');   //session of user
const flash = require('connect-flash');   //for flash alerts
const passport = require('passport');    //for encryption of passwords and whole login and sign up mechanism
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const hotelRoutes = require('./routes/hotels');
const reviewRoutes = require('./routes/reviews');
const mongoSanitize = require('express-mongo-sanitize'); //used to stop mongo injection (dynamic char escaped)
// const helmet = require('helmet');  //contains 11 middlewares to safguard our express apps by setting some headers
const MongoStore = require('connect-mongo')

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/find-hotel';
// 'mongodb://localhost:27017/find-hotel' - local db
//connecting to the db
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs',ejsMate);
//setting view engine as ejs
// where path is the global object and __dirname holds current directory address. Views is the folder where our all web pages will be kept.
//current directory will be set to ./views so we need not to type ./views/file_name to access files from app.js
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'))

//https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0
//the below line is middleware which converts URLencoded form of data to parsed 
//app.use is called everytime as we need to override stuffs and parse everytime app.js is ran
app.use(express.json());
app.use(express.urlencoded({extended: true}))  //is used to parse nested query strings from URL ex: "person[location]=delhi&person[age]=18" -> {person : {location : delhi, age: 18}}
app.use(methodOverride('_method')); //overriding post to use put method
app.use(express.static(path.join(__dirname,'public'))); //for serving the public directory which servers static files which is not needed to be passed to express sv but direclty it will be passed as it is to the required links like HTML file requires CSS...it saves us sv time
app.use(mongoSanitize());  //mongo injection queries are handled

const secretpass = process.env.SECRET || 'iambestintheworld!';


// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// })

//SESSION SETUP
const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 60 * 60
    }),
    name: 'session',
    secret: secretpass,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //its for session security and stops cross site scripts and other unauthorised client side access
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  //date.now() shows date with time in ms so we will set the expiry after 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

// https://www.npmjs.com/package/passport-local-mongoose
//acc to passport doc it must be defined just after sessionConfig
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());  //store the user
passport.deserializeUser(User.deserializeUser());  //unstore the user
//this middleware stores global variables/object which can be accessed from anywhere in project
app.use((req, res, next) => {
    // console.log(req.session); //print it to see returnTo when you try to do unauthorised action without logging in
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');  //now the flash alert will get saved in success key in locals that can be used by router files
    res.locals.error = req.flash('error');  //saved under the name of error
    next();
})

app.use('/', userRoutes);
app.use('/hotels', hotelRoutes);
app.use('/hotels/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home')
});

//if none of the above matches with wat is requested then app.all below will run
//error middleware
app.all('*', (req, res, next) => {
    //res.send("Error found - 404")
    next(new ExpressError('Page Not found',404));
})

//middleware that handles errors when passes using next(err) from different express operations
app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('error', { err });
    // res.send('Error Detected!!')
});
const port = process.env.PORT || 3000;
app.listen(port, () =>{
    console.log(`Serving on port ${port}`)
});

