'use strict';

(function(){//Encapsulation start

  var app = angular.module('screenModule', ['chart.js']);

  app.controller('proxyStatusCtrl', ['$scope', function ($scope) {

	$scope.init = function(){
		console.log(Chart.defaults.global.colours);
	};

	$scope.proxyStatusSucess = 37;
	$scope.proxyStatusFail = 2;

	$scope.proxyStatusLabels = ["Online (37)", "Offline (2)"];
  	$scope.proxyStatusData = [37, 2];
  	$scope.proxyStatusColors = ['#5cb85c','#d9534f'];

  	$scope.pieOptions = {animationEasing: "easeOutCirc", animateRotate : false};

	$scope.init();

	}]);

})();//Encapsulation end