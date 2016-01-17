module.exports = function(db) {
  return function(request, response) {

    var query = db
    .from('best_route_shapes')
    .join('routes', 'routes.id', '=', 'best_route_shapes.id')
    .select('short_name', 'long_name', 'shape_id');

    if (request.query.filterType) {
      query = query.where('routes.type', '=', request.query.filterType);
    }

    query
    .then(function(rows) {
      response.json(rows);
    })
    .catch(function(error) {
      // TODO
      console.log(error);
    });
  }
};
