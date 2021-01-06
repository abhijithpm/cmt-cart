var createError = require('http-errors');
var express = require('express');
var fileUpload=require('express-fileupload');
var bodyparser = require('body-parser')
var messagebird = require('messagebird')('fs19gByo6Y3OqdigOf95qOEQQ') 


var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var dealerRouter = require('./routes/dealer');
var hbs = require('express-handlebars');
var app = express();
var db=require('./config/connection')
var session=require('express-session')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsdir:__dirname+'/views/partials/'}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(bodyparser.urlencoded({extended:true}))

app.use(session({secret:"key",resave:true,saveUninitialized: true,cookie:{maxAge:60000}}))

db.connect((err)=>{
  if(err) console.log("connection Error"+err);
  else console.log("database connected to port 27017");

})


app.use('/admin', adminRouter);
app.use('/', usersRouter);
app.use('/dealer', dealerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
