const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const mongoosePaginate = require('mongoose-paginate');

const PostSchema = new Schema({
	title: String,
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
	category: String,
	body: String,
	footer: String,
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
