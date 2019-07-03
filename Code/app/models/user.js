var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');

// var nameValidator = [
//     validate({
//         validator: 'matches',
//         arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/,
//         message: 'Must be a valid first and last name separated by a space'
//     })
// ]

var emailValidator = [
    validate({
        validator: 'matches',
        arguments: /[a-zA-Z0-9_.+-,;]+@(?:(?:[a-zA-Z0-9-]+\.,;)?[a-zA-Z]+\.,;)?(nwmissouri)\.edu/,
        message: 'Must register with a valid Northwest email'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
]


var usernameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
        validator: 'isAlphanumeric',
        message: 'Username can only consist of letters and numbers'
    })
];


var passwordValidator = [
    validate({
        validator: 'matches',
        arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
        message: 'Password must be at least 8 characters long and must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    }),
    validate({
        validator: 'isLength',
        arguments: [8, 35],
        message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];




var UserSchema = new Schema({
    // name: {
    //     type: String,
    //     required: true,
    //     validate: nameValidator
    // },

    username: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        validate: usernameValidator
    },
    password: {
        type: String,
        required: true,
        validate: passwordValidator,
        select: false
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate: emailValidator
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    temporarytoken: {
        type: String,
        required: true
    },
    resettoken: {
        type: String,
        required: false
    }
});

UserSchema.pre('save', function (next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});

UserSchema.plugin(titlize, {
    paths: ['firstname', 'lastname']
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);