const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ToolReview = require('./toolReview');
const mongoosePaginate = require('mongoose-paginate');

const ToolSchema = new Schema({
	title: String,
	category: String,
	description: String,
	images: [ {url: String, public_id: String} ],
	tag: String,
	url: String,
	topTool: {
		type: Boolean, 
		default: false
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	toolReviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'ToolReview'
		}
	],
	avgRating: { type: Number, default: 0 }
});

ToolSchema.pre('remove', async function() {
	await ToolReview.remove({
		_id: {
			$in: this.toolReviews
		}
	});
});

ToolSchema.methods.calculateAvgRating = function() {
	let ratingsTotal = 0;
	if (this.toolReviews.length) {
		this.toolReviews.forEach(review => {
			ratingsTotal += review.rating;
		});
		this.avgRating = Math.round((ratingsTotal / this.toolReviews.length) * 10) / 10;
	} else {
		this.avgRating = ratingsTotal;
	}
	const floorRating = Math.floor(this.avgRating);
	this.save();
	return floorRating;
}

ToolSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Tool', ToolSchema);