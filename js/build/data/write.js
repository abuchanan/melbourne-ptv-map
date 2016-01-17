function write_routes(db, routes) {
  var stmt = db.prepare("INSERT INTO routes VALUES (?, ?, ?, ?)");
  for (var i = 0; i < routes.length; i++) {
    console.log("write", route);
    var route = routes[i];
    stmt.run(route.id, route.short_name, route.long_name, route.type);
  }
  stmt.finalize();
}


function write_shapes(db, shapes) {
  var stmt = db.prepare("INSERT INTO shape_coordinates VALUES (?, ?, ?)");
  for (var j = 0; j < shapes.length; j++) {
    var shape = shapes[j];
    for (var i = 0; i < shape.coordinates.length; i++) {
      var c = shape.coordinates[i];
      stmt.run(shape.id, c[0], c[1]);
    }
  }
  stmt.finalize();
}


function write_trips(db, trips) {
  var stmt = db.prepare("INSERT INTO trips VALUES (?, ?, ?, ?, ?, ?)");
  for (var i = 0; i < trips.length; i++) {
    var trip = trips[i];
    stmt.run(trip.id, trip.route_id, trip.service_id, trip.shape_id,
             trip.headsign, trip.direction);
  }
  stmt.finalize();
}

function write_schema(db) {
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
}

module.exports = {
  write_routes: write_routes,
  write_shapes: write_shapes,
  write_trips: write_trips,
  write_schema: write_schema
};
