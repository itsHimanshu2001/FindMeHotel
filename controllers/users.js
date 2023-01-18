const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try{
        // const { email, username, password, mobileNumber, dob, name, address } = req.body;
        const user = new User(req.body);
        const registeredUser = await User.register(user, req.body.password);
        //console.log(registeredUser);
        //passport offers us login() to login in to the session so whenever we register we will get loggedin too
        req.login(registeredUser, err => {
            if(err) return next(err);  //if error we go next to error handler
            req.flash('success', `${req.user.username}, Welcome to FindMeHotel!`);
            res.status(201).json({
                status: 'success',
                messasge: 'Registered successfully'
            });
        })
        
    } catch(e){
        // console.log(e); 
        // req.flash('error',e.message);
        // res.redirect('register');
        res.status(400).json({
            status: 'error',
            message: e.message || 'Something went wrong'
        })
        
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    //passport provide us with req.user which will give us the email and username of current user
    req.flash('success', `Welcome back ${req.user.username}`);
    const redirectUrl = req.session.returnTo || '/hotels';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'We hope to see you back soon!');
    res.redirect('/hotels');
}