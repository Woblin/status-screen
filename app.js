'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs');
var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
var asyncRequest = require('request');
var logger = require('morgan');

//Load routes config.
var routes = require('./config/routes');
console.log(routes);
var app = express();


app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public')));


//Routes
app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('Error');
    console.log('Error:' + err.message)
    //res.render('error', {message: err.message,error: err});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;