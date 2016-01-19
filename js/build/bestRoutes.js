
// The raw data contains a lot of route shapes and services I don't understand.
// Some are very short and don't fit the route overview I want.
// So, this selects the longest shapes for each route and save them in
// a summary table.

var knex = require('knex');
var yargs = require('yargs');

var argv = yargs
  .usage('Usage: $0 path/to/db')
  .demand(1)
  .argv;

var dbPath = argv._[0];

var db = knex({
  client: 'sqlite3',
  connection: {
    filename: dbPath
  }
});

var bestRouteShapesQuery = db('routes')
.select('routes.id as id', 'shapes.id as shape_id')
.max('shapes.distance_traveled')
.join('trips', 'trips.route_id', '=', 'routes.id')
.join('shapes', 'shapes.id', '=', 'trips.shape_id')
.groupBy('routes.long_name');

db('best_route_shapes')
.insert(bestRouteShapesQuery)
.finally(function() {
  db.destroy();
});
