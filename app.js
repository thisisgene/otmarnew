var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');

require('./models/project');

var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin/index')

var app = express();


app.enable('trust proxy');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}));

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.redirect("/login");
    console.log(req.session);
  } else {
    next();
  }
}

// app.all("/admin", checkAuth);
// app.all("/admin/*", checkAuth);

app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);

app.post('/login/authenticate', function (req, res) {
  var post = req.body;
  console.log(post.uname, post.upass);
  if (post.uname == 'admin' && post.upass == 'otmar') {
    req.session.user_id = "admin";
    console.log('right', req.session);
    res.redirect('/admin');
  } else {
    console.log('wrong');
    res.redirect('/login');
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
