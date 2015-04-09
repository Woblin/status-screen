/**
 * Module dependencies.
 */
var fs = require('fs');
var asyncRequest = require('request');


//Reqtest authentication
var reqTestAuth = JSON.parse(fs.readFileSync("./reqtestUserAuth.json", 'utf8'));
var options_auth = {user:reqTestAuth.userId,password:reqTestAuth.password};


exports.getReqtest = function(req, res, next) {
	var sparadeKrav = new Array();
	var nextLink = "https://secure.reqtest.com/api/v1/projects/"+reqTestAuth.projectId+"/requirements";

	hamtaReqtestKrav(sparadeKrav, nextLink, 0, res);
}



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