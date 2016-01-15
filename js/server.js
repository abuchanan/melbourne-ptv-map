var fs = require('fs');
var path = require('path');
var express = require('express');
var sqlite3 = require('sqlite3').verbose();


module.exports = function(directory) {
  var app = express();
  var db_path = path.join(__dirname, '..', 'data', 'data.sqlite');
  var db = new sqlite3.Database(db_path);

  app.get('/api/shape/:shapeId', function(request, response) {
    db.all("SELECT longitude, latitude FROM shape_coordinates " +
           "WHERE shape_id = ?",
           request.params.shapeId,
           function(err, rows) {
             if (!err) {
               // TODO
             }

             var coordinates = [];
             for (var i = 0; i < rows.length; i++) {
               var row = rows[i];
               coordinates.push([row.longitude, row.latitude]);
             }

             response.json({
               type: "Feature",
               geometry: {
                 type: "LineString",
                 coordinates: coordinates
               }
             });
           });
  });

  app.get('/api/routes/', function(request, response) {
    db.all("SELECT DISTINCT routes.long_name, trips.shape_id FROM routes " +
           "JOIN trips ON routes.id = trips.route_id",
           function(err, rows) {
             if (!err) {
               // TODO
               console.log(err);
             }
             response.json(rows);
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
