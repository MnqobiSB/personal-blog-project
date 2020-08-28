const Post = require('../models/post');
const Review = require('../models/review');


module.exports = {
	// Reviews Create
	async reviewCreate(req, res, next) {
		// find the post by its id
		let post = await Post.findById(req.params.id).populate('reviews').exec();
		let haveReviewed = post.reviews.filter(review => {
			return review.author.equals(req.user._id);
		}).length;
		if (haveReviewed) {
			req.session.error = 'Sorry, you can only create one comment per post.';
			return res.redirect(`/blog/${post.id}`);
		}
		// create the review
		req.body.review.author = req.user._id;
		let review = await Review.create(req.body.review);
		// assign review to post
		post.reviews.push(review);
		// save the post
		await post.save();
		// redirect to the post
		req.session.success = 'Comment submitted successfully!';
		res.redirect(`/blog/${post.id}`)
	},
	// Reviews Update
	async reviewUpdate(req, res, next) {
		await Review.findByIdAndUpdate(req.params.review_id, req.body.review);
		req.session.success = 'Comment updated successfully!';
		res.redirect(`/blog/${req.params.id}`);
	},
	// Reviews Destroy
	async reviewDestroy(req, res, next) {
		await Post.findByIdAndUpdate(req.params.id, {
			$pull: { reviews: req.params.review_id }
		});
		await Review.findByIdAndRemove(req.params.review_id);
		req.session.success = 'Comment deleted successfully!';
		res.redirect(`/blog/${req.params.id}`);
	}
}