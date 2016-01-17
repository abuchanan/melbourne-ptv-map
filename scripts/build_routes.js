#!/usr/bin/env node

var path = require('path');
var glob = require('glob').sync;
var sqlite3 = require('sqlite3').verbose();

var parsers = require('../js/build/data/parse');
var writers = require('../js/build/data/write');



var DATA_DIR = path.join(__dirname, '..', 'data');


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

function id_mapper(id_mapping) {
  var next_id = 0;
  return function(obj) {
    var new_id = next_id;
    next_id++;
    var original_id = obj.id;
    obj.id = next_id;
    id_mapping[original_id] = new_id;
    return obj;
  };
}

function coordinate_to_string(x) {
  return x.latitude.toString() + '-' + x.longitude.toString();
}

function hash_shape(shape) {
  return shape.coordinates.join(',');
}

function hash_route(route) {
  return [route.short_name, route.long_name, route.type].join(',');
}


function deduper(id_mapping, hash_func) {
  var seen = {};
  var next_id = 0;

  return function(unique, obj) {
    var hash = hash_func(obj);
    var original_id = obj.id;
    var unique_id = seen[hash];

    if (unique_id === undefined) {
      unique_id = next_id;
      next_id++;
      obj.id = unique_id;
      unique.push(obj);
      seen[hash] = unique_id;
    }

    id_mapping[original_id] = unique_id;
    return unique;
  }
}



function build_shapes(id_mapping) {
  return glob(DATA_DIR + '/raw/**/shapes.txt')
    .map(parsers.parse_shape_file)
    .reduce(concat, [])
    .reduce(group_shape_items, [])
    .reduce(deduper(id_mapping.shapes, hash_shape));
}



function build_routes(id_mapping) {
  return glob(DATA_DIR + '/raw/**/routes.txt')
    .map(parsers.parse_route_file)
    .reduce(concat, [])
    .map(deduper(id_mapping.routes, hash_route));
}




function build_trips(id_mapping) {
  function log(trip) {
    console.log(trip);
    return trip;
  }

  function map_foreign_ids(trip) {
    trip.route_id = id_mapping.routes[trip.route_id];
    trip.shape_id = id_mapping.shapes[trip.shape_id];
    return trip;
  }

  return glob(DATA_DIR + '/raw/**/trips.txt')
    .map(parsers.parse_trip_file)
    .reduce(concat, [])
    .map(id_mapper(id_mapping.trips))
    .map(map_foreign_ids)
    .map(log);
}


var db = new sqlite3.Database(DATA_DIR + '/data.sqlite');

db.serialize(function() {

  var id_mapping = {
    routes: {},
    shapes: {},
    trips: {},
  };

  var routes = build_routes(id_mapping);
  var shapes = build_shapes(id_mapping);
  var trips = build_trips(id_mapping);

  write_routes(db, routes);
  write_shapes(db, shapes);
  write_trips(db, trips);
});

db.close();
