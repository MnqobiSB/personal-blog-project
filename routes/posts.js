const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const { 
	asyncErrorHandler, 
	isLoggedIn, 
	isAuthor, 
	isRegisteredAdmin,
	searchAndFilterPosts 
} = require('../middleware');
const { 
	postIndex, 
	postNew, 
	postCreate,
	postShow,
	postEdit,
	postUpdate,
	postDestroy
} = require('../controllers/posts');


/* GET posts Index /posts */
router.get(
	'/', 
	asyncErrorHandler(searchAndFilterPosts), 
	asyncErrorHandler(postIndex)
);

/* GET posts New /posts/new */
router.get('/new', isLoggedIn, isRegisteredAdmin, postNew);

/* POST posts Create /posts */
router.post('/', isLoggedIn, isRegisteredAdmin, upload.array('images', 4), asyncErrorHandler(postCreate));

/* GET posts show /posts/:id */
router.get('/:id',asyncErrorHandler(postShow));

/* GET posts edit /posts/:id/edit */
router.get('/:id/edit', isLoggedIn, isRegisteredAdmin, asyncErrorHandler(isAuthor), postEdit);

/* PUT posts update /posts/:id */
router.put('/:id', isLoggedIn, isRegisteredAdmin, asyncErrorHandler(isAuthor), upload.array('images', 4), asyncErrorHandler(postUpdate));

/* DELETE posts destroy /posts/:id */
router.delete('/:id', isLoggedIn, isRegisteredAdmin, asyncErrorHandler(isAuthor), asyncErrorHandler(postDestroy));

module.exports = router;