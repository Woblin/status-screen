'use strict';

var fs = require('fs');
var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
//var multer  = require('multer');
var syncRequest = require('sync-request');

var asyncRequest = require('request');

var reqtestClient = require('node-rest-client').Client;

var reqTestAuth = JSON.parse(fs.readFileSync(__dirname+"/reqtestUserAuth.json", 'utf8'));

var options_auth = {user:reqTestAuth.userId,password:reqTestAuth.password};

var restClient = new reqtestClient(options_auth);

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
	console.log('reqtest start');
	var sparadeKrav = new Array();
	var nextLink = "https://secure.reqtest.com/api/v1/projects/"+reqTestAuth.projectId+"/requirements";

	hamtaReqtestKrav(sparadeKrav, nextLink, 0, response);
});

function hamtaReqtestKrav(sparadeKrav, nextLink, itterationer, response) {
	itterationer++;
	console.log('itteration: '+itterationer);
	asyncRequest.get(nextLink, function (error, resp, data) {
		console.log('itteration: '+itterationer+" data downloaded");
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
			console.log('reqtest end');
		}
	}).auth(reqTestAuth.userId, reqTestAuth.password, true);
	console.log('itteration: '+itterationer+" data requested");
/*
	restClient.get(nextLink, function(data, res) {
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
			console.log('reqtest end');
		}
	});
*/
}

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



app.get("/updateProxyHostsSync", function(request, response){
	console.log('updateProxyHosts start');
	response.send( updateProxyHostsFile() ? "OK" : "FAIL" );
	console.log('updateProxyHosts end');
});

app.get("/updateProxyHosts", function(request, response){
	console.log('updateProxyHosts start');
	fs.readFile(__dirname+'/url.json', 'utf8', function read(fileError, data) {
		console.log('updateProxyHosts url.json read');
		if(fileError){
			console.log(fileError);
			response.send('FAIL');
			console.log('updateProxyHosts end FAIL 1');
		}

		var urlJson = JSON.parse(data);
		var writtenFiles = 0;
		urlJson.forEach(function (host) {
			console.log('updateProxyHosts get: '+host.url);
			asyncRequest(host.url, function (error, resp, body) {
				console.log('updateProxyHosts write file '+"/proxy-"+host.name+".json");
				fs.writeFile(__dirname+"/proxy-"+host.name+".json", body, function(err) {
					console.log('updateProxyHosts write file '+"/proxy-"+host.name+".json done");
				    if(err) {
				    	console.log(err);
				    	response.send('FAIL');
				    	console.log('updateProxyHosts end FAIL 2');
				    }
				    writtenFiles++;
				    if(writtenFiles == urlJson.length)
				    {
				    	response.send('OK');
				    	console.log('updateProxyHosts end');
				    }
				});
			});
		});
	});
});

app.get("/proxyCheck", function(request,response){
	console.log('proxyCheck start');
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
					console.log('proxyCheck end')
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
	console.log(request.params[0]);
  	response.sendFile( request.params[0], { root: path.join(__dirname, './public') });
});

var port = process.env.PORT || 8989;
var ip = '0.0.0.0';

app.listen(port, ip, function() {
  console.log("Listening on " + port);
});
