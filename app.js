'use strict';

var fs = require('fs');
var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
//var multer  = require('multer');

var asyncRequest = require('request');

var reqTestAuth = JSON.parse(fs.readFileSync(__dirname+"/reqtestUserAuth.json", 'utf8'));

var options_auth = {user:reqTestAuth.userId,password:reqTestAuth.password};


var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data
//app.use(multer({ dest: './uploads/'}));


/* serves main page */
app.get("/", function(request, response) {
	//console.log('static file request : index.html');
  response.sendFile('index.html', { root: path.join(__dirname, './public') })
});

app.get('/reqtest',function(request,response){
	var sparadeKrav = new Array();
	var nextLink = "https://secure.reqtest.com/api/v1/projects/"+reqTestAuth.projectId+"/requirements";

	hamtaReqtestKrav(sparadeKrav, nextLink, 0, response);
});

function hamtaReqtestKrav(sparadeKrav, nextLink, itterationer, response) {
	itterationer++;
	asyncRequest.get(nextLink, function (error, resp, data) {
		var jsonData = JSON.parse(data);
	    var nextLink = null;
	    jsonData.links.forEach(function(link){
	    	if(link.name == "next")
	    	{
	    		nextLink = link.href;
	    	}
	    });

	    jsonData.requirements.forEach(function(reqKrav){
			var krav = {};
			krav.id = reqKrav.customId;
			krav.createdBy = reqKrav.createdBy;

			reqKrav.fieldValues.forEach(function(field){
				krav[field.fieldName] = field.value;
			});
			sparadeKrav.push(krav);
		});

		if(itterationer < 100 && nextLink != null) {
			hamtaReqtestKrav(sparadeKrav, nextLink, itterationer, response);
		} else {
			response.send(sparadeKrav);
		}
	}).auth(reqTestAuth.userId, reqTestAuth.password, true);
}

app.get("/updateProxyHosts", function(request, response){
	fs.readFile(__dirname+'/url.json', 'utf8', function read(fileError, data) {
		if(fileError){
			console.log(fileError);
			response.send('FAIL');
		}

		var urlJson = JSON.parse(data);
		var writtenFiles = 0;
		urlJson.forEach(function (host) {
			asyncRequest(host.url, function (error, resp, body) {
				fs.writeFile(__dirname+"/proxy-"+host.name+".json", body, function(err) {
				    if(err) {
				    	console.log(err);
				    	response.send('FAIL');
				    }
				    writtenFiles++;
				    if(writtenFiles == urlJson.length)
				    {
				    	response.send('OK');
				    }
				});
			});
		});
	});
});

app.get("/proxyCheck", function(request,response){
	var hosts = [];
	var protomatch = /^(https?|ftp):\/\//;
	
	fs.readFile(__dirname+'/proxy-vis.json', 'utf8', function read(fileError, data) {
	    if (fileError) {
	        response.send(fileError);
	    }

	    var hosts = JSON.parse(data);
		var completedPings = [];
		
		hosts.forEach(function (host) {
			var url = host.targetUrl.replace(protomatch, '');

			asyncRequest(host.targetUrl, function (error, resp, body) {
				var res = null,
					status = 999,
					success = true;
				if(error) {
					success = false;
				} else {
					status = resp.statusCode;
				}
				if(status >= 300)
				{
					success = false;
				}
				completedPings.push({url:url,status:status,success:success});
				if(hosts.length == completedPings.length){
					response.send(completedPings);
				}
			});
		});
	});
});

app.get("/404", function(request,response){
	response.status(404).send('Not found');
});

app.get("/500", function(request,response){
	response.status(500).send('Internal Server Error');
});


/* serves all the static files */
app.get(/^(.+)$/, function(request, response) {
	//console.log(request.params[0]);
  	response.sendFile( request.params[0], { root: path.join(__dirname, './public') });
});

var port = process.env.PORT || 8989;
var ip = '0.0.0.0';

app.listen(port, ip, function() {
  console.log("Listening on " + port);
});
