const Tool = require('../models/tool');
const ToolReview = require('../models/toolReview');


module.exports = {
	// Reviews Create
	async toolReviewCreate(req, res, next) {
		// find the tool by its id
		let tool = await Tool.findById(req.params.id).populate('toolReviews').exec();
		let haveReviewed = tool.toolReviews.filter(toolReview => {
			return toolReview.author.equals(req.user._id);
		}).length;
		if (haveReviewed) {
			req.session.error = 'Sorry, you can only create one review per tool.';
			return res.redirect(`/tools/${tool.id}`);
		}
		// create the toolReview
		req.body.toolReview.author = req.user._id;
		let toolReview = await ToolReview.create(req.body.toolReview);
		// assign toolReview to tool
		tool.toolReviews.push(toolReview);
		// save the tool
		await tool.save();
		// redirect to the tool
		req.session.success = 'Review created successfully!';
		res.redirect(`/tools/${tool.id}`)
	},
	// toolReviews Update
	async toolReviewUpdate(req, res, next) {
		await ToolReview.findByIdAndUpdate(req.params.toolReview_id, req.body.toolReview);
		req.session.success = 'Review updated successfully!';
		res.redirect(`/tools/${req.params.id}`);
	},
	// toolReviews Destroy
	async toolReviewDestroy(req, res, next) {
		await Tool.findByIdAndUpdate(req.params.id, {
			$pull: { toolReviews: req.params.toolReview_id }
		});
		await ToolReview.findByIdAndRemove(req.params.toolReview_id);
		req.session.success = 'Review deleted successfully!';
		res.redirect(`/tools/${req.params.id}`);
	}
}