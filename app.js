'use strict';

var fs = require('fs');
var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
//var multer  = require('multer');
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

/* serves all the static files */
app.get(/^(.+)$/, function(req, res) {
    res.sendFile( req.params[0], { root: path.join(__dirname, './public') });
});

var port = process.env.PORT || 8989;
var ip = '127.0.0.1';

app.listen(port, ip, function() {
    console.log("Listening on " + port);
});
