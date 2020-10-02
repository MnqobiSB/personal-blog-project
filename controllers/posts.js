const Post = require('../models/post');
const Tool = require('../models/tool');
const { cloudinary } = require('../cloudinary');

module.exports = {
	// Posts Index
	async postIndex(req, res, next) {
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 10,
			sort: '-_id'
		});
		posts.page = Number(posts.page);
		if (!posts.docs.length && res.locals.query) {
			res.locals.error = 'No results match that query.';
		}
		res.render('posts/index', {
			title: 'All Articles',
			page: 'all-posts',
			url: 'blog',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			posts
		});
	},
	// Posts Web-Development
	async postWeb(req, res, next) {
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
		res.render('posts/web-dev', {
			title: 'Web Development',
			page: 'web-dev',
			url: 'web-development',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			posts
		});
	},
	// Posts Social-Media
	async blogging(req, res, next) {
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
		res.render('posts/blogging', {
			title: 'Blogging',
			page: 'blogging',
			url: 'blogging',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			posts,
		});
	},
	// Posts Social-Media
	async postSoftware(req, res, next) {
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
		res.render('posts/software', {
			title: 'Productivity Software',
			page: 'software',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			posts
		});
	},
	// Posts Digital-Marketing
	async postDigitalMarketing(req, res, next) {
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
		res.render('posts/digital-marketing', {
			title: 'Digital Marketing',
			page: 'digital-marketing',
			url: 'digital-marketing',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			posts
		});
	},
	// Posts Make Money Online
	async postMakeMoneyOnline(req, res, next) {
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
		res.render('posts/make-money-online', {
			title: 'Make Money Online',
			page: 'make-money-online' ,
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			posts
		});
	},
	// Posts New
	postNew(req, res, next) {
		res.render('posts/new', {
			title: 'New Post',
			page: 'new-post' ,
			robots: 'noindex, nofollow',
			googlebot: 'noindex, nofollow'
		});
	},
	// Posts Create
	async postCreate(req, res, next) {
		req.body.post.images = [];
		for(const file of req.files) {
			req.body.post.images.push({
				url: file.secure_url,
				public_id: file.public_id
			});
		}
		req.body.post.author = req.user._id;
		let post = new Post(req.body.post);
		await post.save();
		req.session.success = 'Post created successfully!';
		res.redirect(`/blog/${post.slug}`);
	},
	// Posts Show
	async postShow(req, res, next) {
		let post = await Post.findOne({
			slug: req.params.slug,
			slug2: req.params.slug2
		}).populate({
			path: 'reviews',
			options: { sort: { '_id': -1 } },
			populate: {
				path: 'author',
				model: 'User'
			}
		});

		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 10,
			sort: '-_id'
		});

		let relatedPosts = await Post.find().where('category').equals(post.category).limit(5).exec();

		res.render('posts/show', {
			title: post.title,
			page: 'post-show',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			post,
			posts,
			relatedPosts
		});
	},
	// Posts Edit
	postEdit(req, res, next) {
		res.render('posts/edit', {
			title: 'Edit Post',
			page: 'edit-post',
			robots: 'noindex, nofollow',
			googlebot: 'noindex, nofollow'
		});
	},
	// Posts Update
	async postUpdate(req, res, next) {
		// destructure post from res.locals
		const { post } = res.locals;
		// check if there's any images for deletion
		if (req.body.deleteImages && req.body.deleteImages.length) {
			// assign deleteImages from req.body to its own variable
			let deleteImages = req.body.deleteImages;
			// loop over the deleteImages
			for(const public_id of deleteImages) {
				// delete images from cloudinary
				await cloudinary.v2.uploader.destroy(public_id);
				// delete images from post.images
				for(const image of post.images){
					if (image.public_id === public_id) {
						let index = post.images.indexOf(image);
						post.images.splice(index, 1);
					}
				}
			}
		}
		// check if there are any new images for upload
		if(req.files) {
			// upload images
			for(const file of req.files) {
				// add images to post.images array
				post.images.push({
					url: file.secure_url,
					public_id: file.public_id
				});
			}
		}
		// update the post with any new properties
		post.title = req.body.post.title;
		post.createdAt = req.body.post.createdAt;
		post.mainPostd = req.body.post.mainPostd;
		post.featuredPost = req.body.post.featuredPost;
		post.homeArticle = req.body.post.homeArticle;
		post.popularArticle = req.body.post.popularArticle;
		post.guideArticle = req.body.post.guideArticle;
		post.shortTitle = req.body.post.shortTitle;
		post.category = req.body.post.category;
		post.tag = req.body.post.tag;
		post.categoryUrl = req.body.post.categoryUrl;
		post.body = req.body.post.body;
		post.read = req.body.post.read;

		// save the updated post into the db
		await post.save();
		req.session.success = 'Post updated successfully!';
		// redirect to show page
		res.redirect(`/blog/${post.slug}`);
	},
	// Post Destroy
	async postDestroy(req, res, next) {
		const { post } = res.locals;
		for(const image of post.images) {
			await cloudinary.v2.uploader.destroy(image.public_id);
		}
		await post.remove();
		req.session.success = 'Post deleted successfully!';
		res.redirect('/blog');
	}
}
