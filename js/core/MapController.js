function RoutesService($http) {
  return {
    listAll: function() {
      return $http
        .get('/api/routes/', {params: {filterType: 0}})
        .then(function(response) {
          return response.data;
        }, function(response) {
          // TODO
        });
    },
  }
}
RoutesService.$inject = ['$http'];

function MapController($scope, Routes) {
  $scope.selected = [];
  $scope.routes = [];

  $scope.isSelected = function(route) {
    return $scope.selected.indexOf(route.shape_id) != -1;
  }

  Routes.listAll().then(function(routes) {
    $scope.routes = routes;
  });

  $scope.toggleRoute = function(shapeId) {
    console.log("select route", shapeId);
    var idx = $scope.selected.indexOf(shapeId);
    if (idx == -1) {
      $scope.selected.push(shapeId);
    } else {
      $scope.selected.splice(idx);
    }
  };
}
MapController.$inject = ['$scope', 'RoutesService'];


var module = angular.module('MelbournePTVApp.core', []);

module.factory('RoutesService', RoutesService);
module.controller('MapController', MapController);
