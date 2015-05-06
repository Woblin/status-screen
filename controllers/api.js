var fs = require('fs'),
	request = require('request'),
	cache = require('memory-cache'),
	cacheTTL = 300000; //millis



function fetchJson(url, callback) {
	//console.log('fetchJson: ' + url);

	var cachedData = cache.get(url);
	if (cachedData) {
		console.log('Using cached data');
		callback(cachedData);
		return;
	}

	var options = {
		url: url,
		headers: {
			'Accept-Language': 'sv',
			'Accept': 'application/json'
		},
	}
	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			cache.put(url, data, cacheTTL);
			callback(data);
		}
	});
}


exports.getReqtest = function(callback) {
	var auth = JSON.parse(fs.readFileSync("./reqtestUserAuth.json", 'utf8'));
	var url = 'https://' + auth.userId + ':' + auth.password + '@secure.reqtest.com/api/v1/projects/'+auth.projectId+'/requirements?count=1000';
	fetchJson(url, callback);
}
