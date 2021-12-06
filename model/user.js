var mongoose = require('mongoose');
var Schema =  mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var passport = require('passport');

var UserSchema = new Schema({
    //password and username removed
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    facebookId: String, 
    admin: {
        type: Boolean,
        default: false
    }

});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', UserSchema);
module.exports = User;