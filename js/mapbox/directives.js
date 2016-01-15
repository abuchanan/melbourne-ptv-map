var angular = require('angular');
var Mapbox = require('mapbox-gl');

var module = angular.module('MelbournePTVApp.mapbox', []);

Mapbox.accessToken = 'pk.eyJ1IjoiYnVjaGFuYWUiLCJhIjoiY2loNzR0Y3U5MGd2OXZka3QyMHJ5bXo0ZCJ9.HdT8S-gTjPRkTb4v8Z23KQ';

module.directive('mptvaMapbox', function() {
  return {
    restrict: 'C',
    scope: {},
    link: function(scope, element, attrs) {
      var container = element[0];

      var mapbox = new Mapbox.Map({
        container: container,
        style: 'mapbox://styles/mapbox/streets-v8',
        center: [145.06, -37.79],
        zoom: 10
      });


      mapbox.on('load', function() {
        mapbox.addSource("routes", {
          type: "geojson",
          data: "http://localhost:3000/data/shapes/4-475-C-mjp-1.10.R.json",
        });

        mapbox.addLayer({
          "id": "route-lines",
          "type": "line",
          "source": "routes",
          "paint": {
            "line-color": "#3b52ec",
          }
        });
      });
    }
  };
});
