'use strict';

(function(){//Encapsulation start

  var app = angular.module('screenModule', ['chart.js']);

  app.controller('proxyStatusCtrl', ['$scope', '$http', function ($scope,$http) {

	$scope.init = function(){
		$http.get('/updateProxyHosts').
		success(function(){
			updateProxyInfo();
		}).
		error(proxyErrorHandling);
	};

	var updateProxyInfo = function() {
		$http.get('/proxyCheck').
			success(proxySuccesshandling).
			error(proxyErrorHandling);
	};

	var proxySuccesshandling = function(data, status, headers, config) {
		console.log(data);
		var online = 0;
		var offline = 0;
		data.forEach(function (host) {
			console.log(host.status);
			if(host.status >= 300){
				offline++;
			} else {
				online++;
			}
		});
		$scope.proxyStatusLabels[0] = "Online ("+online+")";
		$scope.proxyStatusLabels[1] = "Offline ("+offline+")";
		$scope.proxyStatusData[0] = online;
		$scope.proxyStatusData[1] = offline;
	};

	var proxyErrorHandling = function(data, status, headers, config) {

	};

	$scope.proxyStatusSucess = 37;
	$scope.proxyStatusFail = 2;

	$scope.proxyStatusLabels = ["Online","Offline"];
	$scope.proxyStatusData = [1,0];
	$scope.proxyStatusColors = ['#5cb85c','#d9534f'];

	$scope.pieOptions = {animationEasing: "easeOutCirc", animateRotate : true};

	$scope.init();

	}]);

})();//Encapsulation end