function RoutesService($http) {
  return {
    listAll: function() {
      return $http
        .get('/api/routes/')
        .then(function(response) {
          return response.data;
        }, function(response) {
          // TODO
        });
    },
    getShape: function(shapeId) {
      return $http
        .get('/api/shape/:shapeId', {shapeId: shapeId})
        .then(function(response) {
          console.log(response);
        }, function(response) {
          // TODO
        });
    }
  }
}
RoutesService.$inject = ['$http'];

function MapController($scope, Routes) {

  Routes.listAll().then(function(routes) {
    $scope.routes = routes;
  });

  $scope.select_route = function(shapeId) {
    console.log("select route", shapeId);
  };

  $scope.routeUrl = "http://localhost:3000/api/shape/2";
}
MapController.$inject = ['$scope', 'RoutesService'];


var module = angular.module('MelbournePTVApp.core', []);

module.factory('RoutesService', RoutesService);
module.controller('MapController', MapController);
