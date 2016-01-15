var angular = require('angular');

require('./core');
require('./mapbox');

var app = angular.module('MelbournePTVApp', [
  'MelbournePTVApp.core',
  'MelbournePTVApp.mapbox',
]);
