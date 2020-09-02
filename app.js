require('dotenv').config();

const createError 	= require('http-errors');
const engine        = require('ejs-mate');
const express 		  = require('express');
const path 			    = require('path');
const cookieParser 	= require('cookie-parser');
const logger 		    = require('morgan');
const session 		  = require('express-session')
const passport		  = require('passport');
const User 			    = require('./models/user');
const mongoose		  = require('mongoose');
const methodOverride = require('method-override');
// const seedPosts     = require('./seeds');
// seedPosts();

// require routes
const indexRouter 	= require('./routes/index');
const postsRouter 	= require('./routes/posts');
const reviewsRouter = require('./routes/reviews');
const toolsRouter   = require('./routes/tools');
const toolsReviewsRouter = require('./routes/toolsReviews');

const app = express();

// connect to the database
mongoose.connect('mongodb://localhost:27017/suburban-digi-hustle', {
	useNewUrlParser: true, 
	useUnifiedTopology: true,
	useCreateIndex: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('We\'re Connected to the DB!');
});

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// set public assets directory
app.use(express.static('public'));

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// configure passport and sessions
app.use(session({
  secret: 'skate is life',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// set local variables middleware
app.use(function(req, res, next) {
  //require moment
  app.locals.moment = require('moment');
  // req.user = {
  //   '_id' : '5eb4439c7f321211888ea8b9',
  //   // '_id' : '5eb4f6dd36cefc1e10a23e49',
  //   // '_id' : '5eb661922ac90909547cc2f1',
  //   'username' : 'mnqobi'
  // }
  res.locals.currentUser = req.user;
  // set default page title
  res.locals.title = 'Suburban Digi Hustle';
  // set success flash message
  res.locals.success = req.session.success || '';
  delete req.session.success;
  // set error flash message
  res.locals.error = req.session.error || '';
  delete req.session.error;
  // continue on to next function in middleware chain
  next();
});

// mount routes
app.use('/', indexRouter);
app.use('/blog', postsRouter);
app.use('/blog/:id/reviews', reviewsRouter);
app.use('/tools', toolsRouter);
app.use('/tools/:id/toolsReviews', toolsReviewsRouter);

// set up download route
const http = require('http').Server(app);

app.get('/download', async function (req, res) {
  await res.download(__dirname + '/public/ebook_folder/ebook.pdf', 'ebook.pdf', function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Download success');
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err.status || 500);
  // res.render('error');
  console.log(err);
  req.session.error = err.message;
  res.redirect('back');
});

module.exports = app;