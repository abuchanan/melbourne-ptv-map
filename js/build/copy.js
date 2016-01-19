var path          = require('path');
var stream        = require('stream');
var notifier      = require('node-notifier');
var vfs           = require('vinyl-fs');
var sequence = require('./sequence');
var yargs = require('yargs');

var argv = yargs
  .usage('Usage: $0 path/to/destination')
  .demand(1)
  .argv;

var ROOT = path.join(__dirname, '..', '..');
var BUILD_DIR = argv._[0];


function build_path() {
  var args = Array.prototype.slice.call(arguments);
  var parts = [BUILD_DIR].concat(args);
  return path.join.apply(null, parts);
}

function build_dest() {
  return vfs.dest(build_path.apply(null, arguments));
}

vfs
.src('css/**/*.css', {base: ROOT})
.pipe(build_dest());

vfs
.src('templates/index.html')
.pipe(build_dest());

vfs
.src('templates/**/*.html', {base: ROOT})
.pipe(build_dest());
