const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({storage});
const { 
	landingPage, 
	getRegister,
	postRegister,
	getLogin, 
	postLogin, 
	getLogout,
	getProfile,
	updateProfile,
	getForgotPw,
	putForgotPw,
	getReset,
	putReset
} = require('../controllers');
const { 
	asyncErrorHandler, 
	isLoggedIn,
	isValidPassword,
	changePassword
} = require('../middleware');

/* GET home/landing page. */
router.get('/', asyncErrorHandler(landingPage));

/* GET /sign-up */
router.get('/sign-up', getRegister);

/* POST /sign-up */
router.post('/sign-up', upload.single('image'), asyncErrorHandler(postRegister));

/* GET /login */
router.get('/sign-in', getLogin);

/* POST /login */
router.post('/sign-in', asyncErrorHandler(postLogin));

/* GET /logout */
router.get('/sign-out', getLogout);

/* GET /profile */
router.get('/profile', isLoggedIn, asyncErrorHandler(getProfile));

/* PUT /profile */
router.put('/profile', 
	isLoggedIn,
	upload.single('image'), 
	asyncErrorHandler(isValidPassword),
	asyncErrorHandler(changePassword),
	asyncErrorHandler(updateProfile)
);

/* GET /forgot */
router.get('/forgot-password', getForgotPw);

/* PUT /forgot */
router.put('/forgot-password', asyncErrorHandler(putForgotPw));

/* GET /reset/:token */
router.get('/reset/:token', asyncErrorHandler(getReset));

/* PUT /reset/:token */
router.put('/reset/:token', asyncErrorHandler(putReset));

module.exports = router;
