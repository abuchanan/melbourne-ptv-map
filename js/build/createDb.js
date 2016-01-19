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

db.schema
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
