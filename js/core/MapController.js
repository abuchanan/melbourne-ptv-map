
function MapController($scope, Routes) {
  $scope.selectedRoutes = [];
  $scope.routes = [];
  $scope.selectedPane = 'tram';

  Routes.listAll("metro tram").then(function(routes) {
    $scope.tramRoutes = orderTramRoutes(routes);
  });

  Routes.listAll("metro bus").then(function(routes) {
    $scope.busRoutes = routes;
  });
}
MapController.$inject = ['$scope', 'RoutesService'];


// These are route short codes.
var tramRouteOrder = [
  '1', '3/3a', '5', '6', '8', '11', '12', '16', '19', '30', '35',
  '48', '55', '57', '59', '64', '67', '70', '72', '75', '78',
  '82', '86', '96', '109'];

function orderTramRoutes(routes) {
  return routes.sort(function(a, b) {
    var ai = tramRouteOrder.indexOf(a.short_name);
    var bi = tramRouteOrder.indexOf(b.short_name);
    return ai - bi;
  });
}

module.exports = MapController;
