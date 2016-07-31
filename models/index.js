var mongoose = require('mongoose');
var config = require('../config');


module.exports = function() {
	mongoose.Promise = global.Promise;
	mongoose.connect(config.connectionstring);

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error...'));
	db.once('open', function (callback) {
	    console.log('blog db opened');
	});
};


