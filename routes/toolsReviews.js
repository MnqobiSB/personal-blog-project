const express = require('express');
const router = express.Router({ mergeParams: true });
const { asyncErrorHandler, isToolReviewAuthor } = require('../middleware');
const {
	toolReviewCreate,
	toolReviewUpdate,
	toolReviewDestroy
} = require('../controllers/toolsReviews');


/* POST toolReviews create /posts/:id/toolReviews */
router.post('/', asyncErrorHandler(toolReviewCreate));

/* PUT toolReviews update /posts/:id/toolReviews/:toolReview_id */
router.put('/:toolReview_id', isToolReviewAuthor, asyncErrorHandler(toolReviewUpdate));

/* DELETE toolReviews destroy /toolReviews/:toolReview_id */
router.delete('/:toolReview_id', isToolReviewAuthor, asyncErrorHandler(toolReviewDestroy));

module.exports = router;