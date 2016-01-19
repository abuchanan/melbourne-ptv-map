var fs = require('fs');
var path = require('path');
var express = require('express');
var api = require('./api');


module.exports = function(dbPath, port, directory) {
  var db = knex({
    client: 'sqlite3',
    connection: {
      filename: dbPath
    }
  });

  var app = express();
  app.use(express.static(directory));

  app.get('/api/shape/:shapeId', api.shape(db));
  app.get('/api/shapes/', api.shapes(db));
  app.get('/api/routes/', api.routes(db));

  app.get('/', function (request, response){
    response.sendFile(path.resolve(directory, 'index.html'));
  });

  var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
  });
}
