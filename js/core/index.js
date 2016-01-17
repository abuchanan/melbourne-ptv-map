var angular = require('angular');

angular
.module('MelbournePTVApp.core', [])
.factory('RoutesService', require('./RoutesService'))
.controller('MapController', require('./MapController'))
.directive('routeList', require('./route-list-directive'));
