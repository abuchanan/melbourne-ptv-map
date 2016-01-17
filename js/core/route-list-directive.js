var SelectionManager = require('./SelectionManager');

module.exports = function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/routes.html',
    scope: {
      routes: '=',
      selected: '='
    },
    link: function(scope, element, attrs) {

      scope.toggle = function(route) {
        SelectionManager.toggle(scope.selected, route.shape_id);
      };

      scope.isSelected = function(route) {
        return SelectionManager.contains(scope.selected, route.shape_id);
      };
    }
  };
};
