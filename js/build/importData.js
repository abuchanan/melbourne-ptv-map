var bluebird = require('bluebird');
var knex = require('knex');
var path = require('path');
var parsers = require('./parseCsvData');
var yargs = require('yargs');

var argv = yargs
  .usage('Usage: $0 path/to/db path/to/raw_data')
  .demand(2)
  .argv;

var dbPath = argv._[0];
var rawDataPath = argv._[1];

var db = knex({
  client: 'sqlite3',
  connection: {
    filename: dbPath
  }
});


var routeTypeCodes = {
  "regional train": 1,
  "metro train": 2,
  "metro tram": 3,
  "metro bus": 4,
  "regional coach": 5,
  "regional bus": 6,
  "telebus": 7,
  "nightrider": 8,
  "interstate": 10,
  "skybus": 11
}

function chunks(data, chunk_size) {
  var chunks = [];
  for (var i = 0; i < data.length; i += chunk_size) {
    var chunk = data.slice(i, i + chunk_size);
    chunks.push(chunk);
  }
  return chunks;
}

function batchInsert(table, rows) {
  var chunkSize = 100;

  return bluebird.mapSeries(chunks(rows, chunkSize), function(chunk) {
    return table.insert(chunk);
  });
}


function importData(routeType) {
  console.log("Importing", routeType);
  
  var typeCode = routeTypeCodes[routeType].toString();
  var routesPath = path.join(rawDataPath, typeCode, 'routes.txt');
  var tripsPath = path.join(rawDataPath, typeCode, 'trips.txt');
  var shapesPath = path.join(rawDataPath, typeCode, 'shapes.txt');

  var routes = parsers.parseRoutesFile(routesPath).map(setRouteType);

  console.log('Loading routes');

  return batchInsert(db('routes'), routes)
  .then(function() {
    console.log('Loading trips');
    var trips = parsers.parseTripsFile(tripsPath);
    return batchInsert(db('trips'), trips);
  })
  .then(function() {
    console.log('Loading shapes');
    var shapes = parsers.parseShapesFile(shapesPath);
    return batchInsert(db('shapes'), shapes);
  });

  function setRouteType(r) {
    r.type = routeType;
    return r;
  }
}



importData("metro tram")
.then(function() {
  return importData("metro bus");
})
.finally(function() {
  db.destroy();
});
