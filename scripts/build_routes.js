#!/usr/bin/env node

var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var glob = require('glob').sync;
var csv = require('csv-string');
var sqlite3 = require('sqlite3').verbose();


var DATA_DIR = path.join(__dirname, '..', 'data');

var ROUTE_TYPES = [
  'tram',
  'subway',
  'rail',
  'bus',
  'ferry',
  'cablecar',
  'gondola',
  'funicular'
];


function parse_csv_file(parse_row, path) {
  var contents = fs.readFileSync(path).toString();
  var rows = csv.parse(contents);
  var records = [];

  // Header row is skipped
  for (var i = 1; i < rows.length; i++) {
    var record = parse_row(rows[i]);
    records.push(record);
  }
  return records;
}


function parse_route_row(row) {
  var type_id = parseInt(row[4]);
  var type = ROUTE_TYPES[type_id];

  return {
    id: row[0],
    short_name: row[2],
    long_name: row[3],
    type: type,
  };
}


function parse_shape_row(row) {
  return {
    id: row[0],
    latitude: parseFloat(row[1]),
    longitude: parseFloat(row[2]),
  };
}


function parse_trip_row(row) {
  return {
    route_id: row[0],
    service_id: row[1],
    id: row[2],
    shape_id: row[3],
    headsign: row[4],
    direction: parseInt(row[5])
  };
}


function update_index(index, item) {
  index[item.id] = item;
  return index;
}


var parse_route_file = parse_csv_file.bind(null, parse_route_row);
var parse_shape_file = parse_csv_file.bind(null, parse_shape_row);
var parse_trip_file = parse_csv_file.bind(null, parse_trip_row);

function concat(a, b) {
  return a.concat(b);
}


function group_shape_items(groups, item) {
  if (groups.length == 0) {
    groups.push({
      id: item.id,
      coordinates: [[item.longitude, item.latitude]]
    });

  } else {
    var g = groups[groups.length - 1];

    if (g.id == item.id) {
      g.coordinates.push([item.longitude, item.latitude]);
    } else {
      groups.push({
        id: item.id,
        coordinates: [[item.longitude, item.latitude]]
      });
    }
  }
  return groups;
}

function coordinate_to_string(x) {
  return x.latitude.toString() + '-' + x.longitude.toString();
}

function hash_shape(shape) {
  var data = shape.coordinates.join(',');
  return crypto.createHash('md5').update(data).digest("hex");
}

function dedupe_shapes(shapes, id_mapping) {
  var seen = {};
  var next_id = 0;
  var unique = [];

  for (var i = 0; i < shapes.length; i++) {
    var shape = shapes[i];
    var shape_hash_key = hash_shape(shape);
    var original_id = shape.id;
    var unique_id = seen[shape_hash_key];

    if (unique_id === undefined) {
      unique_id = next_id++;
      shape.id = unique_id;
      unique.push(shape);
      seen[shape_hash_key] = unique_id;
    }

    id_mapping[original_id] = unique_id;
  }
  return unique;
}

function build_shapes(db, id_mapping) {
  var shapes = glob(DATA_DIR + '/raw/**/shapes.txt')
    .map(parse_shape_file)
    .reduce(concat, [])
    .reduce(group_shape_items, []);

  var unique = dedupe_shapes(shapes, id_mapping);
  unique.map(write_shape(db));
}

function build_routes(db, id_mapping) {

  var next_id = 0;
  function map_ids(route) {
    var new_id = next_id++;
    var original_id = route.id;
    route.id = next_id;
    id_mapping[original_id] = new_id;

    return route;
  }

  var routes = glob(DATA_DIR + '/raw/**/routes.txt')
    .map(parse_route_file)
    .reduce(concat, [])
    .map(map_ids)
    .map(write_route(db));
}


function write_route(db) {
  return function(route) {
    console.log("write", route);
    db.run("INSERT INTO routes VALUES (?, ?, ?, ?)",
           route.id, route.short_name, route.long_name, route.type);
  };
}


function write_shape(db) {
  return function(shape) {
    var stmt = db.prepare("INSERT INTO shape_coordinates VALUES (?, ?, ?)");
    for (var i = 0; i < shape.coordinates.length; i++) {
      var c = shape.coordinates[i];
      stmt.run(shape.id, c[0], c[1]);
    }
    stmt.finalize();
  };
}


function write_trip(db) {
  return function(trip) {
    db.run("INSERT INTO trips VALUES (?, ?, ?, ?, ?, ?)",
           trip.id, trip.route_id, trip.service_id, trip.shape_id,
           trip.headsign, trip.direction);
  };
}


function build_trips(db, id_mapping) {
  function log(trip) {
    console.log(trip);
    return trip;
  }

  var next_id = 0;
  function map_ids(trip) {
    var new_id = next_id++;
    var original_id = trip.id;
    trip.id = next_id;
    id_mapping[original_id] = new_id;

    trip.route_id = id_mapping[trip.route_id];
    trip.shape_id = id_mapping[trip.shape_id];

    return trip;
  }

  glob(DATA_DIR + '/raw/**/trips.txt')
    .map(parse_trip_file)
    .reduce(concat, [])
    .map(map_ids)
    .map(log)
    .map(write_trip(db));
}


var db = new sqlite3.Database(DATA_DIR + '/data.sqlite');

db.serialize(function() {
  db.run("CREATE TABLE routes (" +
    "id INTEGER PRIMARY KEY, " +
    "short_name TEXT, " +
    "long_name TEXT, " +
    "type TEXT" +
    ")");

  db.run("CREATE TABLE shape_coordinates (" +
    "shape_id INTEGER, " +
    "longitude NUMBER, " +
    "latitude NUMBER" +
    ")");

  db.run("CREATE TABLE trips (" +
    "id INTEGER PRIMARY KEY, " +
    "route_id INTEGER, " +
    "service_id TEXT, " +
    "shape_id INTEGER, " +
    "headsign TEXT, " +
    "direction INTEGER" +
    ")");

  db.run("CREATE INDEX shape_coordinates_id_idx ON shape_coordinates (shape_id)");


  var id_mapping = {};
  build_routes(db, id_mapping);
  build_shapes(db, id_mapping);
  build_trips(db, id_mapping);
});

db.close();
