'use strict';

(function(){//Encapsulation start

  var app = angular.module('screenModule', ['chart.js']);

  app.controller('proxyStatusCtrl', ['$scope', '$http', function ($scope,$http) {
  		$scope.loaderVisible = false;

		$scope.init = function(){
			$scope.loaderVisible = true;
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
			var online = 0;
			var offline = 0;
			data.forEach(function (host) {
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
			$scope.loaderVisible = false;
		};

		var proxyErrorHandling = function(data, status, headers, config) {
			$scope.loaderVisible = false;
		};

		$scope.proxyStatusSucess = 37;
		$scope.proxyStatusFail = 2;

		$scope.proxyStatusLabels = ["Online","Offline"];
		$scope.proxyStatusData = [1,0];
		$scope.proxyStatusColors = ['#5cb85c','#d9534f'];

		$scope.pieOptions = {
			animationEasing: "easeOutCirc",
			animateRotate : true
		};

		//$scope.init();

	}]);


	app.controller('reqtestStatusCtrl', ['$scope', '$http', function ($scope,$http) {
		$scope.loaderVisible = true;
		$scope.reqtestKrav = [];
		$scope.krav = [];
		$scope.anvandaStatusar = [];
		$scope.antalAnvandaStatusar = [];
		$scope.pieOptions = {
			animationEasing: "easeOutCirc",
			animateRotate : true,
			legendTemplate: '<ul>'+
					'<% for (var i=0; i<segments.length; i++){%>' +
						'<li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li>' +
					'<%}%>' +
				'</ul>'
		};

		$scope.aktuellSprint = 46;

		$scope.init = function() {
			$scope.loaderVisible = true;
			$http.get('/reqtest').success(hanteraReqtestData);
		};

		var hanteraReqtestData = function(data, status, headers, config) {
			$scope.krav = data;
			$scope.antalArendenSprint = 0;
			$scope.antalAvslutade = 0;
			$scope.antalParkerade = 0;
			$scope.antalPagaende = 0;

			data.forEach(function(krav){
				if(krav.Sprint == $scope.aktuellSprint) {
					var pos = $scope.anvandaStatusar.indexOf(krav["Status på ärendet"]);

					if(pos < 0){
						pos = $scope.anvandaStatusar.length;
						$scope.anvandaStatusar.push(krav["Status på ärendet"]);
						$scope.antalAnvandaStatusar[pos] = 0;
					}
					$scope.antalAnvandaStatusar[pos]++;
					$scope.antalArendenSprint++;

					if(krav["Status på ärendet"] == 'Produktionssatt' || krav["Status på ärendet"] == 'Klar för produktionssättning' || krav["Status på ärendet"] == 'Klar för test') {
						$scope.antalAvslutade++;
					} else if (krav["Status på ärendet"] == 'Parkerat ärendet') {
						$scope.antalParkerade++;
					} else if (krav["Status på ärendet"] == 'Avslutat ärendet') {

					} else {
						$scope.antalPagaende++;
					}

				}
			});
			console.log($scope.anvandaStatusar.length);
			console.log($scope.antalAnvandaStatusar.length);
			$scope.loaderVisible = false;

			console.log($scope.antalArendenSprint);
		};
		
		$scope.init();
	}]);

})();//Encapsulation end