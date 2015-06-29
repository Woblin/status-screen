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
			animateRotate : true,
			responsive: false,
			maintainAspectRatio: false
		};

		//$scope.init();

	}]);


	app.controller('reqtestStatusCtrl', ['$scope', '$http', '$document', function ($scope,$http,$document) {
		$scope.showView = true;

	    $scope.callFunction = function(eventNew) {
			if (eventNew.which == 49)
		    	$scope.showView = true;
		    if (eventNew.which === 50)
		    	$scope.showView = false;

		}

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

		$scope.aktuellSprint = 47;

		$scope.formatTime = 'HH:mm';
		$scope.formatDate = 'yyyy-MM-dd';

		$scope.init = function() {
			$scope.loaderVisible = true;

			$http.get('/reqtestSprintNr').success(function(data, status, headers, config){
				$scope.aktuellSprint = data;
				$http.get('/reqtest').success(hanteraReqtestData);
			});
		};

		var hanteraReqtestData = function(data, status, headers, config) {
			$scope.sprintKrav = [];

			$scope.utvecklare = new Array();
			$scope.utvecklareKrav = new Array();
			$scope.utvecklareKravAvslutade = new Array();

			$scope.krav = data;
			$scope.sprint = {};
			$scope.sprint.antal = {};
			$scope.sprint.antal.arendenSprint = 0;
			$scope.sprint.antal.avslutade = 0;
			$scope.sprint.antal.parkerade = 0;
			$scope.sprint.antal.pagaende = 0;

			$scope.sprint.krav = new Array();

			data.forEach(function(krav){
				if(krav.Sprint == $scope.aktuellSprint) {

					$scope.sprint.krav.push(krav);
					var status = krav["Status på ärendet"];
					if(status == 'Produktionssatt' || status == 'Klar för produktionssättning' || status == 'Klart för test' || status == 'Avslutat ärendet') {
						$scope.sprint.antal.avslutade++;
					} else if (krav["Status på ärendet"] == 'Parkerat ärendet') {
						$scope.sprint.antal.parkerade++;
					} else {
						$scope.sprint.antal.pagaende++;
					}

					//console.log(krav);

					if(krav["Utvecklare"] != null && krav["Utvecklare"] != 'null') {
						var pos = $scope.utvecklare.indexOf(krav["Utvecklare"]);
						if(pos < 0){
							pos = $scope.utvecklare.length;
							$scope.utvecklare.push(krav["Utvecklare"]);
							$scope.utvecklareKrav[pos] = 0;
							$scope.utvecklareKravAvslutade[pos] = 0;
						}
						$scope.utvecklareKrav[pos]++;
						if(status == 'Produktionssatt' || status == 'Klar för produktionssättning' || status == 'Klart för test' || status == 'Avslutat ärendet') {
							$scope.utvecklareKravAvslutade[pos]++;
						}
					}



				}
			});
			$scope.sprint.antal.arendenSprint = $scope.sprint.krav.length;
			$scope.sprint.krav.sort(function(a, b){
					if (a.Prio < b.Prio) //sort string ascending
						return -1 
					if (a.Prio > b.Prio)
						return 1
					return 0 //default return value (no sorting)
			});

			$scope.loaderVisible = false;

			
			$scope.antalAnvandaStatusar.push($scope.sprint.antal.avslutade);
			$scope.antalAnvandaStatusar.push($scope.sprint.antal.arendenSprint - $scope.sprint.antal.avslutade);
			
			$scope.anvandaStatusar.push('Avslutade ärenden');
			$scope.anvandaStatusar.push('Ej avslutade ärenden');
			

			console.log($scope.utvecklareKrav);
			console.log($scope.utvecklare);

			$scope.labels = $scope.utvecklare;
			$scope.datas = [$scope.utvecklareKrav, $scope.utvecklareKravAvslutade];
			$scope.barOptions = {maintainAspectRatio: false}
		};
		
		$scope.init();
	}]);


	app.directive("myCurrentTime", function(dateFilter){
	    return function(scope, element, attrs){
	        var format;
	        
	        scope.$watch(attrs.myCurrentTime, function(value) {
	            format = value;
	            updateTime();
	        });
	        
	        function updateTime(){
	            var dt = dateFilter(new Date(), format);
	            element.text(dt);
	        }
	        
	        function updateLater() {
	            setTimeout(function() {
	              updateTime(); // update DOM
	              updateLater(); // schedule another update
	            }, 1000);
	        }
	        
	        updateLater();
	    }
	});

})();//Encapsulation end