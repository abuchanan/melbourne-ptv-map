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
  // These are route short codes. This defines the order of the results.
  var routeOrder = [
    '1', '3/3a', '5', '6', '8', '11', '12', '16', '19', '30', '35',
    '48', '55', '57', '59', '64', '67', '70', '72', '75', '78',
    '82', '86', '96', '109'];

  $scope.getRouteOrder = function(r) {
    return routeOrder.indexOf(r.short_name);
  }

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
