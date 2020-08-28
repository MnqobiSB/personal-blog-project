const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ToolReviewSchema = new Schema({
	body: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
	rating: {
        type: Number,
        min: 1,
        max: 5,  
        validate: {      
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value."
        }
    },
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}	
}, {
	timestamps: true
});

module.exports = mongoose.model('ToolReview', ToolReviewSchema);