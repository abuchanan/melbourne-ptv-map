var angular = require('angular');
var Mapbox = require('mapbox-gl');

var module = angular.module('MelbournePTVApp.mapbox', []);

// TODO move this to config and delete this token from Mapbox
Mapbox.accessToken = 'pk.eyJ1IjoiYnVjaGFuYWUiLCJhIjoiY2loNzR0Y3U5MGd2OXZka3QyMHJ5bXo0ZCJ9.HdT8S-gTjPRkTb4v8Z23KQ';


module.directive('mapbox', function() {
  return {
    restrict: 'A',
    scope: {
      shapesUrl: '@shapesUrl',
      visibleShapes: '=visibleShapes',
    },
    link: function(scope, element, attrs) {
      var container = element[0];

      var mapbox = new Mapbox.Map({
        container: container,
        style: 'mapbox://styles/mapbox/streets-v8',
        center: [144.89, -37.81],
        zoom: 10.4
      });

      mapbox.on('load', function() {

        mapbox.addSource("trams", {
          type: "geojson",
          data: scope.shapesUrl,
        });

        mapbox.addLayer({
          "id": "tram-lines",
          "source": "trams",
          "type": "line",
          "paint": {
            "line-color": "#3b52ec",
          }
        });

        mapbox.setFilter("tram-lines", ["in", "id"]);

        scope.$watchCollection('visibleShapes', function(visibleShapes) {
          console.log('watch');
          var filter = ["in", "shape_id"].concat(visibleShapes);
          mapbox.setFilter("tram-lines", filter);
        });
      });
    }
  };
});
