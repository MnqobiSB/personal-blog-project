const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({storage});
const { 
	landingPage, 
	downloadEbook,
	getAbout,
	getContact,
	postContact,
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
	putReset,
	getSiteMap,
	getTerms,
	getDisclaimer,
	getPrivacy
} = require('../controllers');
const { 
	asyncErrorHandler, 
	isLoggedIn,
	isValidPassword,
	changePassword
} = require('../middleware');

/* GET home/landing page. */
router.get('/', asyncErrorHandler(landingPage));

/* POST /subscribe */
router.post('/', asyncErrorHandler(downloadEbook));

/* GET /about */
router.get('/about', asyncErrorHandler(getAbout));

/* GET /contact */
router.get('/contact', asyncErrorHandler(getContact));

/* POST /contact */
router.post('/contact', asyncErrorHandler(postContact));

/* GET /sign-up */
router.get('/sign-up', asyncErrorHandler(getRegister));

/* POST /sign-up */
router.post('/sign-up', upload.single('image'), asyncErrorHandler(postRegister));

/* GET /login */
router.get('/sign-in', asyncErrorHandler(getLogin));

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

/* GET /terms-of-use */
router.get('/site-map', asyncErrorHandler(getSiteMap));

/* GET /terms-of-use */
router.get('/terms-of-use', asyncErrorHandler(getTerms));

/* GET /legal-disclaimer */
router.get('/legal-disclaimer', asyncErrorHandler(getDisclaimer));

/* GET /privacy-policy */
router.get('/privacy-policy', asyncErrorHandler(getPrivacy));

module.exports = router;
