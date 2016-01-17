var fs = require('fs');
var path = require('path');
var express = require('express');

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '..', 'data.db')
  }
});


module.exports = function(directory) {
  var app = express();

  app.get('/api/shape/:shapeId', function(request, response) {

    knex
    .from('shapes')
    .select("shape_pt_lon", "shape_pt_lat")
    .where({shape_id: request.params.shapeId})
    .then(function(rows) {

      var coordinates = [];
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        coordinates.push([row.shape_pt_lon, row.shape_pt_lat]);
      }

      response.json({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coordinates
        }
      });
    })
    .catch(function(error) {
      // TODO
      console.log(error);
    });
  });


  app.get('/api/routes/', function(request, response) {

    var query = knex
    .from('route_best_shapes')
    .select('short_name', 'long_name', 'shape_id');

    if (request.query.filterType) {
      query = query.where('route_type', '=', request.query.filterType);
    }

    query
    .then(function(rows) {
      response.json(rows);
    })
    .catch(function(error) {
      // TODO
      console.log(error);
    });
  });

  app.use(express.static(directory));

  app.get('/', function (request, response){
    response.sendFile(path.resolve(directory, 'index.html'));
  });

  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
  });
}
