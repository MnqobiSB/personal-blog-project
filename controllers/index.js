const User = require('../models/user');
const Post = require('../models/post');
const Tool = require('../models/tool');
const passport = require('passport');
const util = require('util');
const { cloudinary } = require('../cloudinary');
const { deleteProfileImage } = require('../middleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

module.exports = {
	// GET /
	async landingPage(req, res, next) {
		// find all posts
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 1000,
			sort: '-_id'
		});
		posts.page = Number(posts.page);
		if (!posts.docs.length && res.locals.query) {
			res.locals.error = 'No results match that query.';
		}
		// find all tools
		let tools = await Tool.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 8,
			sort: '_id'
		});
		// render page/file
		res.render('index', { 
			title: 'Suburban Digi Hustle - Get Valuable Digital Hustle Insights',
			page: 'home',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			posts,
			tools
		});
	},
	// POST /
	async downloadEbook(req, res, next) {
		await download()
		const subscribeData = `
		  	<h1>You Have a New User Newsletters Subscription</h1>
		  	<h2>User Email:</h2>
		  	<ul>
		  		<li>${req.body.firstName}</li>
			    <li>${req.body.email}</li>
		  	</ul>  
		  	<h3>Message</h3>
		  	<p>I Have Downloaded Free eBook and Want To Receive Newsletters</p>
	  	`;

	  	let smtpTransport = nodemailer.createTransport({
		    service: 'Gmail', 
			auth: {
				user: 'amandlamm1@gmail.com',
				pass: process.env.GMAILPW
			},
			tls: {
				rejectUnauthorized: false
			}
	  	});

	  	const mailOptions = {
        	from: '"New Newsletters Subscription" <amandlamm1@gmail.com>',
        	to: 'amandlamm1@gmail.com',
        	subject: 'New Newsletters Subscription',
        	html: subscribeData
      	};

      	await smtpTransport.sendMail(mailOptions);

		req.session.success = `Thanks for requesting to download the Free eBook${req.body.firstName}, check your emails for the direct download link!`;
		res.redirect('/');
	},
	// GET /about
	async getAbout(req, res, next) {
		const admins = await User.find({isAdmin: true});
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 1000,
			sort: '-_id'
		});
		posts.page = Number(posts.page);
		if (!posts.docs.length && res.locals.query) {
			res.locals.error = 'No results match that query.';
		}
		res.render('about', { 
			title: 'About Us',
			page: 'about',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			admins,
			posts
		});
	},
	// GET /contact
	async getContact(req, res, next) {
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 1000,
			sort: '-_id'
		});
		posts.page = Number(posts.page);
		if (!posts.docs.length && res.locals.query) {
			res.locals.error = 'No results match that query.';
		}
		res.render('contact', { 
			title: 'Contact Us',
			page: 'contact',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			posts
		});
	},
	// POST /contact
	async postContact(req, res, next) {
		const userQueryData = `
		  	<h1>You Have a New Enquiry From User</h1>
		  	<h2>Student Contact Details:</h2>
		  	<ul>
			    <li>Name: ${req.body.queryUsername}</li>
			    <li>Email: ${req.body.queryEmail}</li>
			    <li>Subjet: ${req.body.querySubject}</li>
		  	</ul>  
		  	<h3>Message</h3>
		  	<p>${req.body.queryMessage}</p>
	  	`;

	  	let smtpTransport = nodemailer.createTransport({
		    service: 'Gmail', 
			auth: {
				user: 'amandlamm1@gmail.com',
				pass: process.env.GMAILPW
			},
			tls: {
				rejectUnauthorized: false
			}
	  	});

	  	const mailOptions = {
        	from: '"Suburban Digi Hustle" <amandlamm1@gmail.com>',
        	to: 'amandlamm1@gmail.com',
        	subject: 'New General Enquiry',
        	html: userQueryData
      	};

      	await smtpTransport.sendMail(mailOptions);

		req.session.success = `Your enquiry has been successfully sent ${req.body.queryUsername}, a response will be sent to you soon!`;
		res.redirect('/contact');
	},
	// GET /sign-up
	async getRegister(req, res, next) {
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 1000,
			sort: '-_id'
		});
		posts.page = Number(posts.page);
		if (!posts.docs.length && res.locals.query) {
			res.locals.error = 'No results match that query.';
		}
		res.render('sign-up', { 
			title: 'Sign Up',
			page: 'sign-up', 
			username: '', 
			email: '',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			posts 
		});
	},
	// POST /sign-up
	async postRegister(req, res, next){
		try {
			if (req.file) {
				const { secure_url, public_id } = req.file;
				req.body.image = { secure_url, public_id };
			}
			const user = await User.register(new User(req.body), req.body.password);
			req.login(user, function(err) {
				if (err) return next(err);
				req.session.success = `You have successfully signed up, ${user.username}! Welcome on board`;
				res.redirect('/');
			});
		} catch(err) {
			deleteProfileImage(req);
			const { username, email } = req.body;
			let error = err.message;
			if (error.includes('E11000 duplicate key error') && error.includes('index: email_1 dup key')) {
				error = 'A user with the given email is already registered!';
			}
			res.render('sign-up', { 
				title: 'Sign Up', 
				page: 'sign-up',
				robots: 'index, follow',
				googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
				username, 
				email, 
				error 
			});
		}
	},
	// GET /sign-in
	async getLogin(req, res, next) {
		if (req.isAuthenticated()) return res.redirect('/');
		if (req.query.returnTo) req.session.redirectTo = req.headers.referer;
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 1000,
			sort: '-_id'
		});
		posts.page = Number(posts.page);
		if (!posts.docs.length && res.locals.query) {
			res.locals.error = 'No results match that query.';
		}
		res.render('sign-in', { 
			title: 'Sign In',
			page: 'sign-in',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			posts
		});
	},
	// POST /sign-in
	async postLogin(req, res, next) {
		const { username, password } = req.body;
		const { user, error } = await User.authenticate()(username, password);
		if (!user && error) return next(error);
		req.login(user, function(err) {
			if (err) return next(err);
			req.session.success = `Welcome back ${username}, We missed you!`;
			const redirectUrl = req.session.redirectTo || '/';
			delete req.session.redirectTo;
			res.redirect(redirectUrl);
		});
	},
	// GET /sign-out
	getLogout(req, res, next) {
		req.logout();
		req.session.success = `Goodbye, come back soon!`;
		res.redirect('/');
	},
	// GET /profile
	async getProfile(req, res, next) {
		const posts = await Post.find().where('author').equals(req.user._id).limit(1000).exec();
		res.render('profile', {
			title: 'My Profile',
			page: 'profile',
			robots: 'noindex, nofollow',
			googlebot: 'noindex, nofollow',
			posts
		});
	},
	// PUT /profile
	async updateProfile(req, res, next) {
		const {
			username,
			email
		} = req.body;
		const { user } = res.locals;
		if (username) user.username = username;
		if (email) user.email = email;
		if (req.file) {
			if (user.image.public_id) await cloudinary.v2.uploader.destroy(user.image.public_id);
			const { secure_url, public_id } = req.file;
			user.image = { secure_url, public_id }; 
		}
		await user.save();
		const login = util.promisify(req.login.bind(req));
		await login(user);
		req.session.success = 'Profile successfully updated!';
		res.redirect('/profile');
	},
	// GET /users/forgot
	getForgotPw(req, res, next) {
		res.render('users/forgot', {
			title: 'Forgot Password',
			page: 'forgot',
			robots: 'noindex, nofollow',
			googlebot: 'noindex, nofollow'
		});
	},
	// PUT /users/forgot
	async putForgotPw(req, res, next) {
		const token = await crypto.randomBytes(20).toString('hex');
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			req.session.error = 'No account with that email exists.';
			return res.redirect('/forgot-password');
		}
		user.resetPasswordToken = token;
		user.resetPasswordExpires = Date.now() + 3600000;
		await user.save();

		const smtpTransport = nodemailer.createTransport({
			service: 'Gmail', 
			auth: {
				user: 'amandlamm1@gmail.com',
				pass: process.env.GMAILPW
			},
			tls: {
				rejectUnauthorized: false
			}
		});

		const msg = {
			to: email,
			from: '"Suburban Digi Hustle Admin" <amandlamm1@gmail.com>',
			subject: 'Suburban Digi Hustle - Forgot Password / Reset',
			text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          		'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          		'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          		'If you did not request this, please ignore this email and your password will remain unchanged.\n'
		  	// html: '<strong>and easy to do anywhere, even with Node.js</strong>',
		};
		await smtpTransport.sendMail(msg);

		req.session.success = `An email has been sent to ${email} with further instructions.`;
		res.redirect('/forgot-password');
	},
	// GET /users/reset
	async getReset(req, res, next) {
		const { token } = req.params;
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() }
		});

		if (!user) {
			req.session.error = 'Password reset token is invalid or has expired.';
			return res.redirect('/forgot-password');
		}

		res.render('users/reset', { 
			title: 'Reset Password',
			page: 'reset',
			robots: 'noindex, nofollow',
			googlebot: 'noindex, nofollow',
			token 
		});
	},
	// PUT /users/reset
	async putReset(req, res, next) {
		const { token } = req.params;
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() }
		});

		if (!user) {
			req.session.error = 'Password reset token is invalid or has expired!';
			return res.redirect('/forgot-password');
		}

		if (req.body.password === req.body.confirm) {
			await user.setPassword(req.body.password);
			user.resetPasswordToken = null;
			user.resetPasswordExpires = null;
			await user.save();
			const login = util.promisify(req.login.bind(req));
			await login(user);
		} else {
			req.session.error = 'Passwords do not match!';
			return res.redirect(`/reset/${ token }`);
		}

		const smtpTransport = nodemailer.createTransport({
			service: 'Gmail', 
			auth: {
				user: 'amandlamm1@gmail.com',
				pass: process.env.GMAILPW
			},
			tls: {
				rejectUnauthorized: false
			}
		});

		const msg = {
	    to: user.email,
	    from: '"Suburban Digi Hustle Admin" <amandlamm1@gmail.com>',
	    subject: 'Suburban Digi Hustle - Password Reset successful!',
	    text: `Hello,
		  	This email is to confirm that the password for your account has just been changed.
		  	If you did not make this change, please hit reply and notify us at once.`.replace(/		  	/g, '')
	  	};

	 	await smtpTransport.sendMail(msg);

	  	req.session.success = 'Password reset successful!';
	  	res.redirect('/');
	},
	// GET /terms
	getSiteMap(req, res, next) {
		res.render('site-map', { 
			title: 'Site Map',
			page: 'site-map',
			robots: 'noindex, nofollow',
			googlebot: 'noindex, nofollow'
		});
	},
	// GET /terms
	async getTerms(req, res, next) {
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 1000,
			sort: '-_id'
		});
		posts.page = Number(posts.page);
		if (!posts.docs.length && res.locals.query) {
			res.locals.error = 'No results match that query.';
		}

		res.render('terms', { 
			title: 'Terms Of Use',
			page: 'terms',
			robots: 'noindex, nofollow',
			googlebot: 'noindex, nofollow',
			posts
		});
	},
	// GET /disclaimer
	async getDisclaimer(req, res, next) {
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 1000,
			sort: '-_id'
		});
		posts.page = Number(posts.page);
		if (!posts.docs.length && res.locals.query) {
			res.locals.error = 'No results match that query.';
		}

		res.render('disclaimer', { 
			title: 'Legal Disclaimer',
			page: 'disclaimer',
			robots: 'noindex, nofollow',
			googlebot: 'noindex, nofollow',
			posts
		});
	},
	// GET /privacy
	async getPrivacy(req, res, next) {
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 1000,
			sort: '-_id'
		});
		posts.page = Number(posts.page);
		if (!posts.docs.length && res.locals.query) {
			res.locals.error = 'No results match that query.';
		}

		res.render('privacy-policy', { 
			title: 'Privacy Policy',
			page: 'privacy',
			robots: 'noindex, nofollow',
			googlebot: 'noindex, nofollow',
			posts
		});
	}
}