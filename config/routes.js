/**
 * Module dependencies.
 */
var express = require('express');
var router = express.Router();
//var cors  = require('./cors');

//Controllers
var reqtest = require('../controllers/reqtest');
var proxy = require('../controllers/proxy');


/* serves main page */
router.get("/", function(request, response) {
	//console.log('static file request : index.html');
	response.sendFile('index.html', { root: path.join(__dirname, './public') })
});

router.get('/reqtest', reqtest.getReqtest);

router.get('/updateProxyHosts', proxy.updateProxyHosts);

router.get('/proxyCheck', proxy.proxyCheck);


module.exports = router;