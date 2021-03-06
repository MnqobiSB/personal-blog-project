const express = require('express');
const router = express.Router();
const Post = require('../models/post');
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
	postWeb,
	blogging,
	postSoftware,
	postDigitalMarketing,
	postMakeMoneyOnline,
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

/* GET posts Web-Development /posts */
router.get(
	'/web-development',
	asyncErrorHandler(searchAndFilterPosts),
	asyncErrorHandler(postWeb)
);

/* GET posts Social-Media /posts */
router.get(
	'/blogging',
	asyncErrorHandler(searchAndFilterPosts),
	asyncErrorHandler(blogging)
);

/* GET posts Software /posts */
router.get(
	'/productivity-software',
	asyncErrorHandler(searchAndFilterPosts),
	asyncErrorHandler(postSoftware)
);

/* GET posts Digital-Marketing /posts */
router.get(
	'/digital-marketing',
	asyncErrorHandler(searchAndFilterPosts),
	asyncErrorHandler(postDigitalMarketing)
);

/* GET posts Digital-Marketing /posts */
router.get(
	'/make-money-online',
	asyncErrorHandler(searchAndFilterPosts),
	asyncErrorHandler(postMakeMoneyOnline)
);

/* GET posts New /posts/new */
router.get('/new', isLoggedIn, isRegisteredAdmin, postNew);

/* POST posts Create /posts */
router.post('/', isLoggedIn, isRegisteredAdmin, upload.array('images', 4), asyncErrorHandler(postCreate));

/* GET posts show /posts/:id */
router.get('/:slug',asyncErrorHandler(postShow));

/* GET posts edit /posts/:id/edit */
router.get('/:id/edit', isLoggedIn, isRegisteredAdmin, asyncErrorHandler(isAuthor), postEdit);

/* PUT posts update /posts/:id */
router.put('/:id', isLoggedIn, isRegisteredAdmin, asyncErrorHandler(isAuthor), upload.array('images', 4), asyncErrorHandler(postUpdate));

/* DELETE posts destroy /posts/:id */
router.delete('/:id', isLoggedIn, isRegisteredAdmin, asyncErrorHandler(isAuthor), asyncErrorHandler(postDestroy));

module.exports = router;
