/**
 * Module dependencies.
 */
var fs = require('fs');
var asyncRequest = require('request');



exports.updateProxyHosts = function(req, res, next) {
	fs.readFile('./url.json', 'utf8', function read(fileError, data) {
		if(fileError){
			console.log(fileError);
			res.send('FAIL');
		}

		var urlJson = JSON.parse(data);
		var writtenFiles = 0;
		urlJson.forEach(function (host) {
			asyncRequest(host.url, function (error, resp, body) {
				fs.writeFile("./proxy-"+host.name+".json", body, function(err) {
				    if(err) {
				    	console.log(err);
				    	res.send('FAIL');
				    }
				    writtenFiles++;
				    if(writtenFiles == urlJson.length)
				    {
				    	res.send('OK');
				    }
				});
			});
		});
	});
};


exports.proxyCheck = function(req, res, next) {
	var hosts = [];
	var protomatch = /^(https?|ftp):\/\//;
	
	fs.readFile('./proxy-vis.json', 'utf8', function read(fileError, data) {
	    if (fileError) {
	        res.send(fileError);
	    }

	    var hosts = JSON.parse(data);
		var completedPings = [];
		
		hosts.forEach(function (host) {
			var url = host.targetUrl.replace(protomatch, '');

			asyncRequest(host.targetUrl, function (error, resp, body) {
				var ress = null,
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
					//console.log(completedPings);
					res.send(completedPings);
				}
			});
		});
	});
};