
function RoutesService($http) {
  return {
    listAll: function(filterType) {
      return $http
        .get('/api/routes/', {
          params: {
            filterType: filterType
          }
        })
        .then(function(response) {
          return response.data;
        }, function(response) {
          // TODO
        });
    },
  }
}
RoutesService.$inject = ['$http'];

module.exports = RoutesService;
