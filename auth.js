var express = require('express');
var router = express.Router();
var connection = require('./db');


//display login page
router.get('/', function (req, res, next) {
    // render to views/user/add.ejs
    res.render('login', {
        title: 'VChat Login',
        message: {
            error: '',
            success: ''
        },
        username: '',
        password: ''
    });
});

//display login page
router.get('/login', function (req, res, next) {
    // render to views/user/add.ejs
    res.render('login', {
        title: 'VChat Login',
        username: '',
        password: ''
    });
});

//authenticate user
router.post('/authentication', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    connection.query('SELECT * FROM `users` WHERE username = ? AND password = ?', [username, password], function (err, rows, fields) {
        if (err) throw err;
        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'Please correct enter email and Password!');
            res.redirect('/auth/');
        }
        else { // if user found
            // render to views/user/edit.ejs template file
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/auth/home');
        }
    });
});

//display register page
router.get('/register', function (req, res, next) {
    // render to views/user/add.ejs
    res.render('register', {
        title: 'VChat Registration Page',
        username: '',
        email: '',
        DateOfBirth: '',
        address: '',
        PhoneNumber: '',
        password: '',
        password_repeat: ''
    });
});

// user registration
router.post('/post', function (req, res, next) {
    console.log("In post-register");
    req.assert('username', 'Name is required').notEmpty();          //Validate name
    req.assert('email', 'A valid email is required').isEmail();  //Validate email
    req.assert('password', 'Password is required').notEmpty();   //Validate password
    if (req.sanitize('password').escape().trim() == req.sanitize('password_repeat').escape().trim()) {
        var errors = req.validationErrors();
        if (!errors) {   //No errors were found.  Passed Validation!
            var user = {
                username: req.sanitize('name').escape().trim(),
                email: req.sanitize('email').escape().trim(),
                DateOfBirth: req.sanitize('DateOfBirth').escape().trim(),
                PhoneNumber: req.sanitize('PhoneNumber').escape().trim(),
                address: req.sanitize('address').escape().trim(),
                password: req.sanitize('password').escape().trim()
            };
            connection.query('INSERT INTO users SET ?', user, function (err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err);
                    // render to views/user/add.ejs
                    res.render('register', {
                        title: ' VChat Registration Page',
                        username: '',
                        email: '',
                        DateOfBirth: '',
                        address: '',
                        PhoneNumber: '',
                        password: '',
                        password_repeat: ''
                    });
                } else {
                    req.flash('success', 'You have successfully signup!');
                    res.redirect('login');
                }
            });
        }
        else {   //Display errors to user
            var error_msg = '';
            errors.forEach(function (error) {
                error_msg += error.msg + '<br>';
            });
            req.flash('error', error_msg);
            /**
            * Using req.body.name 
            * because req.param('name') is deprecated
            */
            res.render('register', {
                title: 'VChat Registration Page',
                username: req.body.username,
                email: req.body.email,
                DateOfBirth: req.body.DateOfBirth,
                address: req.body.address,
                PhoneNumber: req.body.PhoneNumber,
                password: '',
                password_repeat: ''
            });
        }
    } else {
        res.render('register', {
            title: 'VChat Registration Page',
            username: req.body.username,
            email: req.body.email,
            DateOfBirth: req.body.DateOfBirth,
            address: req.body.address,
            PhoneNumber: req.body.PhoneNumber,
            password: '',
            password_repeat: ''
        });
    }

});


//display home page
router.get('/home', function (req, res, next) {
    if (req.session.loggedin) {
        res.render('home', {
            title: "VChat",
            username: req.session.name,
        });
    } else {
        req.flash('success', 'Please login first!');
        res.redirect('/auth/');
    }
});

// Logout user
router.get('/logout', function (req, res) {
    req.session.destroy();
    //req.flash('success', 'Login Again Here');
    res.redirect('/auth/');
});

module.exports = router;