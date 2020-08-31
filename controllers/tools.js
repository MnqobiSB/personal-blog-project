const Tool = require('../models/tool');
const Post = require('../models/post');
const { cloudinary } = require('../cloudinary');

module.exports = {
	// tools Index
	async toolIndex(req, res, next) {
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		let tools = await Tool.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 4,
			sort: '_id'
		});
		tools.page = Number(tools.page);
		if (!tools.docs.length && res.locals.query) {
			res.locals.error = 'No results match that query.';
		}
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 5,
			sort: '-_id'
		});
		res.render('tools/index', { 
			title: 'Our tools',
			page: 'tools',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			tools,
			posts 
		});
	},
	// tools New
	toolNew(req, res, next) {
		res.render('tools/new', { 
			title: 'Create New tool',
			page: 'new-tool', 
			robots: 'noindex, nofollow',
			googlebot: 'noindex, nofollow'
		});
	},
	// tools Create
	async toolCreate(req, res, next) {
		req.body.tool.images = [];
		for (const file of req.files) {
			req.body.tool.images.push({
				url: file.secure_url,
				public_id: file.public_id
			});
		}
		req.body.tool.author = req.user._id;
		let tool = new Tool(req.body.tool);
		await tool.save();
		req.session.success = 'Tool created successfully!';
		res.redirect(`/tools/${tool.id}`);
	},
	// tools Show
	async toolShow(req, res, next) {
		let tool = await Tool.findById(req.params.id).populate({
			path: 'toolReviews',
			options: { sort: { '_id': -1 } },
			populate: {
				path: 'author',
				model: 'User'
			}
		});
		const floorRating = tool.calculateAvgRating();
		
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		// const floorRating = tool.avgRating;
		let posts = await Post.paginate(dbQuery, {
			page: req.query.page || 1,
			limit: 5,
			sort: '-_id'
		});
		res.render('tools/show', { 
			title: tool.title,
			page: 'tool-show',
			robots: 'index, follow',
			googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
			tool,
			posts, 
			floorRating 
		});
	},
	// tools Edit
	toolEdit(req, res, next) {
		res.render('tools/edit', { 
			title: 'Edit tool',
			page: 'edit-tool',
			robots: 'noindex, nofollow',
			googlebot: 'noindex, nofollow'
		});
	},
	// tools Update
	async toolUpdate(req, res, next) {
		// destructure tool from res.locals
		const { tool } = res.locals;
		// check if there's any images for deletion
		if (req.body.deleteImages && req.body.deleteImages.length) {
			// assign deleteImages from req.body to its own variable
			let deleteImages = req.body.deleteImages;
			// loop over the deleteImages
			for(const public_id of deleteImages) {
				// delete images from cloudinary
				await cloudinary.v2.uploader.destroy(public_id);
				// delete images from tool.images
				for(const image of tool.images){
					if (image.public_id === public_id) {
						let index = tool.images.indexOf(image);
						tool.images.splice(index, 1);
					}
				}
			}
		}
		// check if there are any new images for upload
		if(req.files) {
			// upload images
			for(const file of req.files) {
				// add images to tool.images array
				tool.images.push({
					url: file.secure_url,
					public_id: file.public_id
				});
			} 
		}
		// update the tool with any new properties
		tool.title = req.body.tool.title;
		tool.topTool = req.body.tool.topTool;
		tool.category = req.body.tool.category;
		tool.tag = req.body.tool.tag;
		tool.url = req.body.tool.url;
		tool.description = req.body.tool.description;
		// save the updated tool into the db
		await tool.save();
		req.session.success = 'tool updated successfully!';
		// redirect to show page
		res.redirect(`/tools/${tool.id}`);
	},
	// tool Destroy
	async toolDestroy(req, res, next) {
		const { tool } = res.locals;
		for(const image of tool.images) {
			await cloudinary.v2.uploader.destroy(image.public_id);
		}
		await tool.remove();
		req.session.success = 'tool deleted successfully!';
		res.redirect('/tools');
	}
}