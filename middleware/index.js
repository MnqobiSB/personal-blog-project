const Review = require('../models/review');
const User = require('../models/user');
const Post = require('../models/post');
const ToolReview = require('../models/toolReview');
const Tool = require('../models/tool');
const { cloudinary } = require('../cloudinary');

function escapeRegExp (string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const middleware = {
	asyncErrorHandler: (fn) => (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	},
	isReviewAuthor: async (req, res, next) => {
		let review = await Review.findById(req.params.review_id);
		if (review.author.equals(req.user._id)) {
			return next();
		}
		req.session.error = 'bye bye';
		return res.redirect('/');
	},
	isToolReviewAuthor: async (req, res, next) => {
		let toolReview = await ToolReview.findById(req.params.toolReview_id);
		if (toolReview.author.equals(req.user._id)) {
			return next();
		}
		req.session.error = 'bye bye';
		return res.redirect('/');
	},
	isLoggedIn: (req, res, next) => {
		if (req.isAuthenticated()) return next();
		req.session.error = 'You need to be signed in to do that!';
		req.session.redirectTo = req.originalUrl;
		res.redirect('/sign-in');
	},
	isAuthor: async (req, res, next) => {
		const post = await Post.findById(req.params.id);
		if (post.author.equals(req.user._id)) {
			res.locals.post = post;
			return next();
		}
		req.session.error = 'Access denied!';
		res.redirect('back');
	},
	isToolAuthor: async (req, res, next) => {
		const tool = await Tool.findById(req.params.id);
		if (tool.author.equals(req.user._id)) {
			res.locals.tool = tool;
			return next();
		}
		req.session.error = 'Access denied!';
		res.redirect('back');
	},
	isRegisteredAdmin: (req, res, next) => {
		if (req.user.isAdmin) return next();
		req.session.error = 'Access Denied! Bye Bye';
		req.session.redirectTo = req.originalUrl;
		res.redirect('back');
	},
	isValidPassword: async (req, res, next) => {
		const { user } = await User.authenticate()(
			req.user.username,
			req.body.currentPassword
		);
		if (user) {
			// add user to res.locals
			res.locals.user = user;
			next();
		} else {
			middleware.deleteProfileImage(req);
			req.session.error = 'Incorrect current password!';
			return res.redirect('/profile');
		}
	},
	changePassword: async (req, res, next) => {
		const { newPassword, passwordConfirmation } = req.body;

		if (newPassword && !passwordConfirmation) {
			middleware.deleteProfileImage(req);
			req.session.error = 'Missing password confirmation!';
			return res.redirect('/profile');
		} else if (newPassword && passwordConfirmation) {
			const { user } = res.locals;
			if (newPassword === passwordConfirmation) {
				await user.setPassword(newPassword);
				next();
			} else {
				middleware.deleteProfileImage(req);
				req.session.error = 'New passwords must match!';
				return res.redirect('/profile');
			}
		} else {
			next();
		}
	},
	deleteProfileImage: async (req) => {
		if (req.file) await cloudinary.v2.uploader.destroy(req.file.public_id);
	},
	async searchAndFilterPosts (req, res, next) {
		const queryKeys = Object.keys(req.query);

		if (queryKeys.length) {
			const dbQueries = [];
			let { search } = req.query;

			if (search) {
				search = new RegExp(escapeRegExp(search), 'gi');
				dbQueries.push({
					$or: [
						{ title: search },
						{ category: search },
						{ tag: search },
						{ body: search },
						{ footer: search }
					]
				});
			}

			res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};
		}

		res.locals.query = req.query;

		queryKeys.splice(queryKeys.indexOf('page'), 1);
		const delimiter = queryKeys.length ? '&' : '?';
		res.locals.paginateUrl =
			req.originalUrl.replace(/(\?|\&)page=\d+/g, '') +
			`${delimiter}page=`;

		next();
	},
	async searchAndFilterTools (req, res, next) {
		const queryKeys = Object.keys(req.query);

		if (queryKeys.length) {
			const dbQueries = [];
			let { search, category, avgRating } = req.query;

			if (search) {
				search = new RegExp(escapeRegExp(search), 'gi');
				dbQueries.push({
					$or: [
						{ title: search },
						{ description: search },
						{ category: search },
						{ tag: search }
					]
				});
			}

			if (category) {
				dbQueries.push({ category: { $in: category } });
			}

			if (avgRating) {
				dbQueries.push({ avgRating: { $in: avgRating } });
			}

			res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};
		}

		res.locals.query = req.query;

		queryKeys.splice(queryKeys.indexOf('page'), 1);
		const delimiter = queryKeys.length ? '&' : '?';
		res.locals.paginateUrl =
			req.originalUrl.replace(/(\?|\&)page=\d+/g, '') +
			`${delimiter}page=`;

		next();
	}
};

module.exports = middleware;
