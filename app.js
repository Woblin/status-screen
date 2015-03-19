'use strict';

var fs = require('fs');
var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
//var multer  = require('multer');
var syncRequest = require('sync-request');



var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data
//app.use(multer({ dest: './uploads/'}));


/* serves main page */
app.get("/", function(request, result) {
	//console.log('static file request : index.html');
  result.sendFile('index.html', { root: path.join(__dirname, './public') })
});

app.post("/write", function(request, result) {
  /* some server side logic */
  result.send("OK");
});

app.post("/pingCheck", function(request,result){
	result.send("OK");
});


function updateProxyHostsFile()
{
	var urlJsonStr = fs.readFileSync(__dirname+"/url.json", 'utf8');
	var urlJson = JSON.parse(urlJsonStr);

	urlJson.forEach(function (host) {
		var res = syncRequest('GET', host.url);
		var body = res.getBody();

		fs.writeFile(__dirname+"/proxy-"+host.name+".json", body, function(err) {
	    if(err) {
	    	console.log(err);
	      return false;
	    }
		});

	});
	return true;
}



app.get("/updateProxyHosts", function(request, result){
	result.send( updateProxyHostsFile() ? "OK" : "FAIL" );
});

app.get("/proxyCheck", function(request,result){
	var hosts = [];
	var protomatch = /^(https?|ftp):\/\//;
	var proxyVisBuffer = fs.readFileSync(__dirname+"/proxy-vis.json", 'utf8');

	var hosts = JSON.parse(proxyVisBuffer);
	
	var completedPings = [];
	//Only promise wrapper supports configable ping options
	hosts.forEach(function (host) {
		var url = host.targetUrl.replace(protomatch, '');

		var res = null,
			status = null,
			success = true;
		try{
			res = syncRequest('GET', host.targetUrl);
			status = res.statusCode;
		} catch (err) {
	    console.log(err);
	    success = false;
	    status = 999;
	  }

	  if(status >= 300){
			console.log(status);
			success = false;
		}

		completedPings.push({url:url,status:status,success:success});
	});

	result.send(completedPings);

});

app.get("/404", function(request,response){
	response.status(404).send('Not found');
});

app.get("/500", function(request,response){
	response.status(500).send('Internal Server Error');
});


/* serves all the static files */
app.get(/^(.+)$/, function(request, result) {
  result.sendFile( request.params[0], { root: path.join(__dirname, './public') });
});

var port = process.env.PORT || 8989;
var ip = '0.0.0.0';

app.listen(port, ip, function() {
  console.log("Listening on " + port);
});
