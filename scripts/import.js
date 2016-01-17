var path = require('path');
var knex = require('knex');
var bluebird = require('bluebird');
var parsers = require('../js/build/parse_csv_data');

var db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '..', 'data.db')
  }
});


var raw_data_directory = path.join(__dirname, '..', 'data', 'raw');

var route_type_codes = {
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

function create_schema() {
  return db.schema
  .createTable('routes', function(table) {
    table.text('id').primary();
    table.text('agency_id');
    table.text('short_name');
    table.text('long_name');
    table.text('type');
  })

  .createTable('trips', function(table) {
    table.text('id').primary();
    table.text('route_id').index();
    table.text('service_id');
    table.text('shape_id').index();
    table.text('headsign');
    table.integer('direction');
  })

  .createTable('shapes', function(table) {
    table.text('id').index();
    table.float('latitude');
    table.float('longitude');
    table.integer('sequence');
    table.float('distance_traveled');
  })

  .createTable('best_route_shapes', function(table) {
    table.text('id').primary();
    table.text('shape_id').index();
    table.float('length');
  });
}

function chunks(data, chunk_size) {
  var chunks = [];
  for (var i = 0; i < data.length; i += chunk_size) {
    var chunk = data.slice(i, i + chunk_size);
    chunks.push(chunk);
  }
  return chunks;
}

function batch_insert(table, rows) {
  var chunk_size = 100;

  return bluebird.mapSeries(chunks(rows, chunk_size), function(chunk) {
    return table.insert(chunk);
  });
}


function import_data(route_type) {
  var type_code = route_type_codes[route_type].toString();
  var routes_path = path.join(raw_data_directory, type_code, 'google_transit', 'routes.txt');
  var trips_path = path.join(raw_data_directory, type_code, 'google_transit', 'trips.txt');
  var shapes_path = path.join(raw_data_directory, type_code, 'google_transit', 'shapes.txt');

  var routes = parsers.parse_routes_file(routes_path).map(set_route_type);

  console.log('Loading routes');

  return batch_insert(db('routes'), routes)
  .then(function() {
    console.log('Loading trips');
    var trips = parsers.parse_trips_file(trips_path);
    return batch_insert(db('trips'), trips);
  })
  .then(function() {
    console.log('Loading shapes');
    var shapes = parsers.parse_shapes_file(shapes_path);
    return batch_insert(db('shapes'), shapes);
  });

  function set_route_type(r) {
    r.type = route_type;
    return r;
  }
}

// The raw data contains a lot of route shapes and services I don't understand.
// Some are very short and don't fit the route overview I want.
// So, this selects the longest shapes for each route and save them in
// a summary table.
function select_best_routes() {
  var best_route_shapes_query = db('routes')
  .select('routes.id as id', 'shapes.id as shape_id')
  .max('shapes.distance_traveled')
  .join('trips', 'trips.route_id', '=', 'routes.id')
  .join('shapes', 'shapes.id', '=', 'trips.shape_id')
  .groupBy('routes.long_name');

  return db('best_route_shapes').insert(best_route_shapes_query);
}



create_schema()
.then(function() {
  return import_data("metro tram");
})
.then(function() {
  console.log("Selecting best routes");
  return select_best_routes();
})
.catch(function(err) {
  if (/table ".*" already exists/.test(err.message)) {
    console.error("Looks like the database already exists. This is meant to be create a new database.");
  } else {
    console.error(err.message);
  }
})
.finally(function() {
  db.destroy();
});
