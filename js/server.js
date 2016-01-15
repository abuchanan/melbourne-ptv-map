var fs = require('fs');
var path = require('path');
var express = require('express');


module.exports = function(directory) {
  var app = express();

  app.use(express.static(directory));

  // handle every other route with index.html, which will contain
  // a script tag to your application's JavaScript file(s).
  app.get('*', function (request, response){
    response.sendFile(path.resolve(directory, 'index.html'));
  });

  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
  });
}
