function MapController($scope) {
  $scope.foo = 'test';
}
MapController.$inject = ['$scope'];


var module = angular.module('MelbournePTVApp.core', []);

module.controller('MapController', MapController);
