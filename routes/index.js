var express = require('express');
var mongoose = require('mongoose');
var crypto = require('crypto');
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/'});
require('../models/BlogModel')
require('../models/UsersModel')
var User = mongoose.model('User');
var Blog = mongoose.model('Blog');
var session = require('express-session');
var flash = require('connect-flash');
var markdown = require('markdown').markdown;
var dateFormat = require('dateformat');



module.exports = function(app) {

	var home =function (req, res) {
			res.render('home', {
				title: 'Home',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		};

	var index =function (req, res) {
		Blog.find().sort({_id: -1}).exec(function (err, blogs){
			if (err) {
		 		req.flash('error', err);
				post = [];
			}
			res.render('index', {
				title: 'Home',
				user: req.session.user,
				blogs: blogs,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	};

	var index_post =function (req, res) {
		var name = req.body.name;
		var password = req.body.password;

		var md5 = crypto.createHash('md5');
		var hash_password = md5.update(password).digest('hex');

		User.findOne({name:name}, function (err, user) {
			if (err) {
				req.flash('error', "Error! Please try again");
				return res.redirect('/');
			}
			if (!user) {
				req.flash('error', 'User Not Exists!');
				return res.redirect('/');
			}
			if (user.hash_password != hash_password) {
				req.flash('error', 'Wrong Passoword!');
				return res.redirect('/');
			}
			req.session.user = user;
			req.flash('success', 'Login success!');
			res.redirect( '/' );
		});
	};




	var reg_get = function (req, res) {
		res.render('reg', {
		    title: 'Reg',
		    user: req.session.user,
		    success: req.flash('success').toString(),
		    reg_error: req.flash('reg_error').toString(),
			error: req.flash('error').toString()
		});
	};

	var reg_post = function (req, res) {

		var name = req.body.name;
		var password = req.body.password;
		var password_re = req.body['password-repeat'];

		if (password_re != password) {
			req.flash('reg_error', 'Two input password does not match!');
			return res.redirect('/reg');
			}

		var md5 = crypto.createHash('md5');
	 	var hash_password = md5.update(req.body.password).digest('hex');

		User.findOne({name:name}, function (err, user) {
			if (err) {
		 		req.flash('reg_error', err);
		 		return res.redirect('/');
	    	}
	    	if (user) {
				req.flash('reg_error', 'User Exists! Please choose another one.');
	 			return res.redirect('/reg');
	    	}
			new User({
				name : name,
				email : req.body.email,
				phone: req.body.phone,
				hash_password: hash_password
				}).save(function(err, user){
		            if (err) {
		                req.flash('reg_error', 'Reg Error!');
		                res.redirect( '/' );
		            }
					req.session.user = user;
					req.flash('success', 'Signup success! ');
					res.redirect( '/' );
			});
		});
	}

	var post_get = function (req, res) {
		res.render('post', {
		    title: 'Post',
		    user: req.session.user,
		    success: req.flash('success').toString(),
		    error: req.flash('error').toString()
		});
	};

	var post_post = function (req, res, next) {
		var currentUser = req.session.user;
		var content = markdown.toHTML(req.body.content);
		var currentTime=dateFormat(Date.now(), "yyyy-mm-dd h:MM:ss");
		var imgs = [];
	    for (var i = 0, len = req.files.length; i<len; i++)
		{
			console.log(req.files[i].filename);
			imgs.push(req.files[i].filename);
		}
        console.log(req.files);
		new Blog({
			title : req.body.title,
			content : content,
			author_name : currentUser.name,
			create_at : currentTime,
			images : imgs,
			}).save(function(err, blog){
				if (err) {
					req.flash('error', err);
					res.redirect( '/index' );
				}
				req.flash('success', 'Post success!');
				res.redirect( '/index' );
			});
	};
	/*app.post('/post', multer({ dest: './uploads/'}).single('image'), function(req,res){
	console.log(req.body); //form fields
	/* example output:
	{ title: 'abc' }
	
	console.log(req.file); //form files
	/* example output:
            { fieldname: 'upl',
              originalname: 'grumpy.png',
              encoding: '7bit',
              mimetype: 'image/png',
              destination: './uploads/',
              filename: '436ec561793aa4dc475a88e84776b1b9',
              path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
              size: 277056 }
	 
	res.status(204).end();
}); */
	var logout = function (req, res) {
		req.session.user = null;
		req.flash('success', 'Logout Success!');
		res.redirect('/');
	};

	var oneblog = function (req, res) {
		var blog_id = req.params.blog_id;
		Blog.findOne({ _id : blog_id}, function(err, blog){
			if (err) {
				req.flash('error', err);
				res.redirect( '/' );
			} else {
				res.render('blog', {
					title: "Blog",
					blog: blog,
					user: req.session.user,
		    		success: req.flash('success').toString(),
		    		error: req.flash('error').toString()
				});
			}
		});
	}

	var blog_comment = function (req, res) {
		var blog_id = req.params.blog_id;
		var currentTime=dateFormat(Date.now(), "yyyy-mm-dd h:MM:ss");
		var comment = {
		      name: req.body.name,
		      comment: req.body.comment,
		      time: currentTime,
			};
		Blog.findOne({ _id : blog_id}, function(err, blog){
			if (err) {
				req.flash('error', err);
				res.redirect( '/' );
			} else {
				blog.comments.push(comment);
				blog.save();
				res.redirect( 'back' );
			}
		});
	}




	var edit_get = function (req, res) {
		var blog_id = req.params.blog_id;
		Blog.findOne({ _id : blog_id}, function(err, blog){
			if (err) {
				req.flash('error', err);
				res.redirect( '/' );
			} else {
				res.render('edit', {
					title: "Blog",
					blog: blog,
					user: req.session.user,
		    		success: req.flash('success').toString(),
		    		error: req.flash('error').toString()
				});
			}
		});
	}

	var edit_post = function (req, res) {
		var blog_id = req.params.blog_id;
		var author_name = req.body.author_name;
		console.log(req.session.user.name);
		console.log(author_name);
		if (req.session.user.name != author_name) {
			req.flash('error', "You do not have the premission to edit");
			res.redirect( '/' );
		}
		var content = req.body.content;
		var currentTime=dateFormat(Date.now(), "yyyy-mm-dd h:MM:ss");

		update = {
			title: req.body.title,
			content: content,
			update_at: currentTime,
			create_at : currentTime
		}

		Blog.update({ _id : blog_id}, update, function(err){
			if (err) {
				req.flash('error', err);
				res.redirect( '/' );
			} else {
				res.redirect('/blog/' + blog_id);
			}
		});
	}


	var blog_delete = function (req, res) {
		var blog_id = req.params.blog_id;
		Blog.findOne({ _id : blog_id}).remove(). exec(function(err){
			if (err) {
				req.flash('error', err);
				res.redirect( '/index' );
			} else {
				res.redirect('/index');
			}
		});
	}



	var myblog =function (req, res) {
		author_name = req.session.user.name;
		Blog.find({author_name: author_name}).exec(function (err, blogs){
			if (err) {
		 		req.flash('error', err);
				post = [];
			}
			res.render('index', {
				title: 'MyBlog',
				user: req.session.user,
				blogs: blogs,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	};

	var checkLogin = function (req, res, next) {
	  if (!req.session.user) {
	    req.flash('error', 'Not Logged!');
	    res.redirect('/');
	  }
	  next();
	}

	var checkNotLogin = function (req, res, next) {
	  if (req.session.user) {
	    req.flash('error', 'Already Logged!');
	    res.redirect('back');
	  }
	  next();
	}

	app.get('/', home);
	app.get('/index', index);
	app.post('/', index_post);

	app.get('/reg', checkNotLogin);
	app.get('/reg', reg_get);
	app.post('/reg', checkNotLogin);
	app.post('/reg', reg_post);

	/*app.post('/post', multer({ dest: './uploads/'}).single('image'), function(req,res){
	console.log(req.body); //form fields
	/* example output:
	{ title: 'abc' }
	
	console.log(req.file); //form files
	/* example output:
            { fieldname: 'upl',
              originalname: 'grumpy.png',
              encoding: '7bit',
              mimetype: 'image/png',
              destination: './uploads/',
              filename: '436ec561793aa4dc475a88e84776b1b9',
              path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
              size: 277056 }
	 
	res.status(204).end();
}); */
	app.get('/post', checkLogin);
	app.get('/post', post_get);
	app.post('/post', checkLogin);
	app.post('/post', upload.array('images', 8), post_post);

	app.get('/logout', checkLogin);
	app.get('/logout', logout);

	app.get('/blog/:blog_id', oneblog);
	app.post('/blog/:blog_id', blog_comment);

	app.get('/myblog', myblog);
	app.get('/edit/:blog_id/', edit_get);
	app.post('/edit/:blog_id/', edit_post);

	app.get('/delete/:blog_id/', blog_delete);



}
