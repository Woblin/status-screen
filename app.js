'use strict';

var fs = require('fs');
var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
//var multer  = require('multer');
var ping = require('ping');

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data
//app.use(multer({ dest: './uploads/'}));


/* serves main page */
app.get("/", function(req, res) {
	//console.log('static file request : index.html');
  res.sendFile('index.html', { root: path.join(__dirname, './public') })
});

app.post("/write", function(req, res) {
  /* some server side logic */
  res.send("OK");
});

app.post("/pingCheck", function(req,res){
	res.send("OK");
});

app.get("/pingCheck", function(request,result){
	var hosts = [{
		name:'google.com',
		host:'google.com',
		sourceUrl:'google.com'
	},{
		name:'yahoo.com',
		host:'yahoo.com',
		sourceUrl:'yahoo.com'
	},{
		name:'facebook.com',
		host:'facebook.com',
		sourceUrl:'facebook.com'
	},{
		name:'woblin.se',
		host:'woblin.se',
		sourceUrl:'woblin.se'
	},{
		name:'arbetsformedlingen.se',
		host:'arbetsformedlingen.se',
		sourceUrl:'arbetsformedlingen.se'
	},{
		name:'sydsvenskan.se',
		host:'sydsvenskan.se',
		sourceUrl:'sydsvenskan.se'
	}];
	
	var completedPings = [];
	//Only promise wrapper supports configable ping options
	hosts.forEach(function (host) {
	  ping.promise.probe(host.host, {
	    timeout: 500
	  }).then(function (res) {
	    completedPings.push(res);
	    if(completedPings.length == hosts.length)
	    {
	    	result.send(completedPings);
	    }
	  });
	});

});

/* serves all the static files */
app.get(/^(.+)$/, function(req, res) {
  res.sendFile( req.params[0], { root: path.join(__dirname, './public') });
});

var port = process.env.PORT || 8989;
var ip = '127.0.0.1';

app.listen(port, ip, function() {
  console.log("Listening on " + port);
});
