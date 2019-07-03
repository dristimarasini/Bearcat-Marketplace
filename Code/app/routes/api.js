//routes
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'harrpotter';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');


module.exports = function (router) {


    var options = {
        auth: {
            api_user: 'aawajjoshi',
            api_key: 'Raiichu1!'
        }
    }

    var client = nodemailer.createTransport(sgTransport(options));



    //user registration router
    router.post('/users', function (req, res) {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        //user.name = req.body.name;
        user.temporarytoken = jwt.sign({
            username: user.username,
            email: user.email
        }, secret, {
            expiresIn: '24h'
        });
        if (req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == '') {
            res.json({
                success: false,
                message: 'Ensure username, email, and password are provided'
            })
        } else {
            user.save(function (err) {
                if (err) {

                    if (err.errors != null) {
                        if (err.errors.email) {
                            res.json({
                                success: false,
                                message: err.errors.email.message
                            });
                        } else if (err.errors.username) {
                            res.json({
                                success: false,
                                message: err.errors.username.message
                            });
                        } else if (err.errors.password) {
                            res.json({
                                success: false,
                                message: err.errors.password.message
                            });
                        } else {
                            res.json({
                                success: false,
                                message: err
                            });
                        }
                    } else if (err) {
                        if (err.code == 11000) {
                            if (err.errmsg[71] == "u") {
                                res.json({
                                    success: false,
                                    message: 'Username already taken'
                                });
                            } else if (err.errmsg[71] == "e") {
                                res.json({
                                    success: false,
                                    message: 'Email already taken'
                                });
                            }

                        } else {
                            res.json({
                                success: false,
                                message: err
                            });
                        }
                    }

                } else {


                    var email = {
                        from: 'Bearcat Marketplace, staff@bearcatmarketplace.com',
                        to: user.email,
                        subject: 'Account Activation',
                        text: 'Hello ' + user.username + ', Thank you for registering at Bearcat Marketplace. Please click on the link to activate your account:http://localhost:8080/activate/' + user.temporarytoken,
                        html: 'Hello ' + user.username + ',<br><br>Thank you for registering at Bearcat Marketplace. Please click on the link to activate your account:<br><br><a href="http://localhost:8080/activate/' + user.temporarytoken + '">http://localhost:8080/activate/</a>'
                    };

                    client.sendMail(email, function (err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Message sent: ' + info.response);
                        }
                    });
                    res.json({
                        success: true,
                        message: 'Please check your email for account activation link'
                    })
                }
            });
        }
    });



    router.post('/checkusername', function (req, res) {
        User.findOne({
            username: req.body.username
        }).select('username').exec(function (err, user) {
            if (err) throw err;

            if (user) {
                res.json({
                    success: false,
                    message: 'Username already taken'
                });
            } else {
                res.json({
                    success: true,
                    message: 'Valid username'
                });
            }
        });
    });



    router.post('/checkemail', function (req, res) {
        User.findOne({
            email: req.body.email
        }).select('email').exec(function (err, user) {
            if (err) throw err;

            if (user) {
                res.json({
                    success: false,
                    message: 'Email already registered'
                });
            } else {
                res.json({
                    success: true,
                    message: 'Valid email'
                });
            }
        });
    });










    //user login route
    router.post('/authenticate', function (req, res) {
        User.findOne({
            username: req.body.username
        }).select('email username password active').exec(function (err, user) {
            if (err) throw err;

            if (!user) {
                res.json({
                    success: false,
                    message: 'Could not authenticate user'
                });
            } else if (user) {
                if (req.body.password) {
                    var validPassword = user.comparePassword(req.body.password);
                } else {
                    res.json({
                        success: false,
                        message: 'No password provided'
                    });
                }
                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Could not authenticate password'
                    });
                } else if (!user.active) {
                    res.json({
                        success: false,
                        message: 'Account has not been activated. Please check your email for activation link.',
                        expired: true
                    })
                } else {
                    var token = jwt.sign({
                        username: user.username,
                        email: user.email
                    }, secret, {
                        expiresIn: '24h'
                    });
                    res.json({
                        success: true,
                        message: 'User authenticated',
                        token: token
                    });
                }
            }
        });
    });


    router.put('/activate/:token', function (req, res) {
        User.findOne({
            temporarytoken: req.params.token
        }, function (err, user) {
            if (err) throw err;
            var token = req.params.token;


            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Activation link has expired'
                    });
                } else if (!user) {
                    res.json({
                        success: false,
                        message: 'Activation link has expired'
                    });
                } else {

                    user.temporarytoken = false;
                    user.active = true;
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {

                            var email = {
                                from: 'Bearcat Marketplace, staff@bearcatmarketplace.com',
                                to: 'user.email',
                                subject: 'Account Activated',
                                text: 'Hello ' + user.username + ', Your account has been activated.',
                                html: 'Hello ' + user.username + ',<br><br>Your account has been activated.'
                            };

                            client.sendMail(email, function (err, info) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('Message sent: ' + info.response);
                                }
                            });
                            res.json({
                                success: true,
                                message: 'Account activated'
                            });
                        }


                    });
                }

            });
        });
    });



    router.post('/resend', function (req, res) {
        User.findOne({
            username: req.body.username
        }).select('username password active').exec(function (err, user) {
            if (err) throw err;

            if (!user) {
                res.json({
                    success: false,
                    message: 'Could not authenticate user'
                });
            } else if (user) {
                if (req.body.password) {
                    var validPassword = user.comparePassword(req.body.password);
                } else {
                    res.json({
                        success: false,
                        message: 'No password provided'
                    });
                }
                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Could not authenticate password'
                    });
                } else if (user.active) {
                    res.json({
                        success: false,
                        message: 'Account already activated'
                    })
                } else {
                    res.json({
                        success: true,
                        user: user
                    });
                }
            }
        });
    });

    router.put('/resend', function (req, res) {
        User.findOne({
            username: req.body.username
        }).select('username email temporarytoken').exec(function (err, user) {
            if (err) throw error;
            user.temporarytoken = jwt.sign({
                username: user.username,
                email: user.email
            }, secret, {
                expiresIn: '24h'
            });
            user.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    var email = {
                        from: 'Bearcat Marketplace, staff@bearcatmarketplace.com',
                        to: user.email,
                        subject: 'Account Activation Request',
                        text: 'Hello ' + user.username + ', You recently requested a new account activation link. Please click on the link to activate your account:http://localhost:8080/activate/' + user.temporarytoken,
                        html: 'Hello ' + user.username + ',<br><br>You recently requested a new account activation link. Please click on the link to activate your account:<br><br><a href="http://localhost:8080/activate/' + user.temporarytoken + '">http://localhost:8080/activate/</a>'
                    };

                    client.sendMail(email, function (err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Message sent: ' + info.response);
                        }
                    });
                    res.json({
                        success: true,
                        message: 'Activation link sent to ' + user.email
                    });
                }
            });
        })

    });



    // Route to send user's username to e-mail
    router.get('/resetusername/:email', function (req, res) {
        User.findOne({
            email: req.params.email
        }).select('email username').exec(function (err, user) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                }); // Error if cannot connect
            } else {
                if (!user) {
                    res.json({
                        success: false,
                        message: 'E-mail was not found'
                    }); // Return error if e-mail cannot be found in database
                } else {
                    // If e-mail found in database, create e-mail object
                    var email = {
                        from: 'Bearcat Marketplace, staff@bearcatmarketplace.com',
                        to: user.email,
                        subject: 'Bearcat Marketplace Username Request',
                        text: 'Hello ' + user.username + ', You recently requested your username. Your username is: ' + user.username,
                        html: 'Hello ' + user.username + ',<br><br>You recently requested your username. Your username is: <br><br>' + user.username
                    };

                    // Function to send e-mail to user
                    client.sendMail(email, function (err, info) {
                        if (err) {
                            console.log(err); // If error in sending e-mail, log to console/terminal
                        } else {
                            console.log(info); // Log confirmation to console
                        }
                    });
                    res.json({
                        success: true,
                        message: 'Username has been sent to e-mail! '
                    }); // Return success message once e-mail has been sent
                }
            }
        });
    });



    router.put('/resetpassword', function (req, res) {
        User.findOne({
            username: req.body.username
        }).select('username active email resettoken').exec(function (err, user) {
            if (err) throw err;

            if (!user) {
                res.json({
                    success: false,
                    message: 'Username not found'
                });

            } else if (!user.active) {
                res.json({
                    success: false,
                    message: 'Account has not been activated'
                });
            } else {
                user.resettoken = jwt.sign({
                    username: user.username,
                    email: user.email
                }, secret, {
                    expiresIn: '24h'
                });
                user.save(function (err) {
                    if (err) {
                        res.json({
                            success: false,
                            message: err
                        });
                    } else {

                        var email = {
                            from: 'Bearcat Marketplace, staff@bearcatmarketplace.com',
                            to: user.email,
                            subject: 'Bearcat Marketplace Reset Password Request',
                            text: 'Hello ' + user.username + ', You recently requested for a password reset. Please click on the link to reset your password: http://localhost:8080/reset/' + user.resettoken,
                            html: 'Hello ' + user.username + ',<br><br>You recently requested for a password reset. Please click on the link to reset your password:<br><br><a href="http://localhost:8080/reset/' + user.resettoken + '">http://localhost:8080/reset/</a>'
                        };

                        client.sendMail(email, function (err, info) {
                            if (err) {
                                console.log(err);
                            }
                        });


                        res.json({
                            success: true,
                            message: 'Please check email for password reset link'
                        });
                    }
                })
            }
        });
    });

    router.get('/resetpassword/:token', function (req, res) {
        User.findOne({
            resettoken: req.params.token
        }).select().exec(function (err, user) {
            if (err) {
                throw err;
            }

            var token = req.params.token;
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Password link has expired'
                    });
                } else {
                    if (!user) {
                        res.json({
                            success: false,
                            message: 'Password link has expired'
                        });
                    } else {
                        res.json({
                            success: true,
                            user: user
                        });
                    }
                }
            })
        });
    });

    router.put('/savepassword', function (req, res) {
        User.findOne({
            username: req.body.username
        }).select('username email password resettoken').exec(function (err, user) {
            if (err) throw err;
            if (req.body.password === null || req.body.password === '') {
                res.json({
                    success: false,
                    message: 'Password not provided'
                });
            } else {
                user.password = req.body.password;
                user.resettoken = false;
                user.save(function (err) {
                    if (err) {
                        res.json({
                            success: false,
                            message: err
                        });
                    } else {

                        var email = {
                            from: 'Bearcat Marketplace, staff@bearcatmarketplace.com',
                            to: user.email,
                            subject: 'Password Reset',
                            text: 'Hello ' + user.username + ', This email is to notify you that your password was recently changed at Bearcat Marketplace',
                            html: 'Hello ' + user.username + ',<br><br>This email is to notify you that your password was recently changed at Bearcat Marketplace'
                        };

                        client.sendMail(email, function (err, info) {
                            if (err) {
                                console.log(err);
                            }
                        });

                        res.json({
                            success: true,
                            message: 'Password has been reset'
                        })
                    }
                });
            }
        })

    })



    //middleware for routes that checks for token
    router.use(function (req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token'];

        if (token) {
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'token invalid'
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.json({
                success: false,
                message: 'No token provided'
            });
        }
    });

    router.post('/me', function (req, res) {
        res.send(req.decoded);
    });



    return router;
}