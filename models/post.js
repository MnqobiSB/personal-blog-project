const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const mongoosePaginate = require('mongoose-paginate');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const PostSchema = new Schema({
	title: String,
	slug: { type: String, slug: 'title' },
	createdAt: {
		type: Date,
		default: Date.now
	},
	images: [
		{
			url: String,
			public_id: String
		}
	],
	mainPost: {
		type: Boolean,
		default: false
	},
	featuredPost: {
		type: Boolean,
		default: false
	},
	homeArticle: {
		type: Boolean,
		default: false
	},
	popularArticle: {
		type: Boolean,
		default: false
	},
	guideArticle: {
		type: Boolean,
		default: false
	},
	category: String,
	tag: String,
	categoryUrl: String,
	body: String,
	read: {
        type: Number,
        min: 1,
        max: 15,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value."
        }
    },
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review'
		}
	]
});

PostSchema.pre('remove', async function() {
	await Review.remove({
		_id: {
			$in: this.reviews
		}
	});
});

PostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', PostSchema);
