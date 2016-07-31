var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;


var Userschema = new Schema({
    name:String,
    hash_password:String,
    sex:Number,
    email:String,
    phone:Number,
    address:{city:String, street:String}
});



function encryptPassword(password) {
    return crypto.createHash("md5").update(password).digest("base64");
}

mongoose.model('User', Userschema);