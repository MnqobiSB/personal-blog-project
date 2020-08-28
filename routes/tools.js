const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const { 
	asyncErrorHandler, 
	isLoggedIn, 
	isToolAuthor,
	isRegisteredAdmin, 
	searchAndFilterTools 
} = require('../middleware');
const { 
	toolIndex, 
	toolNew, 
	toolCreate,
	toolShow,
	toolEdit,
	toolUpdate,
	toolDestroy
} = require('../controllers/tools');


/* GET tools Index /tools */
router.get(
	'/', 
	asyncErrorHandler(searchAndFilterTools), 
	asyncErrorHandler(toolIndex)
);

/* GET tools New /tools/new */
router.get('/new', isLoggedIn, isRegisteredAdmin, toolNew);

/* POST tools Create /tools */
router.post('/', isLoggedIn, isRegisteredAdmin, upload.array('images', 4), asyncErrorHandler(toolCreate));

/* GET tools show /tools/:id */
router.get('/:id',asyncErrorHandler(toolShow));

/* GET tools edit /tools/:id/edit */
router.get('/:id/edit', isLoggedIn, isRegisteredAdmin, asyncErrorHandler(isToolAuthor), toolEdit);

/* PUT tools update /tools/:id */
router.put('/:id', isLoggedIn, isRegisteredAdmin, asyncErrorHandler(isToolAuthor), upload.array('images', 4), asyncErrorHandler(toolUpdate));

/* DELETE tools destroy /tools/:id */
router.delete('/:id', isLoggedIn, isRegisteredAdmin, asyncErrorHandler(isToolAuthor), asyncErrorHandler(toolDestroy));

module.exports = router;