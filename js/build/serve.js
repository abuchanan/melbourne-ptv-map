var yargs = require('yargs');

var argv = yargs
  .usage('Usage: $0 port path/to/db path/to/app_root')
  .demand(3)
  .argv;

var port = argv._[0];
var dbPath = argv._[1];
var appRoot = argv._[2];

var server = require('../server');
server(dbPath, port, directory);
