var browserify = require('browserify-incremental');
var path = require('path');
var source        = require('vinyl-source-stream');
var vfs = require('vinyl-fs');
var yargs = require('yargs');

var argv = yargs
  .usage('Usage: $0 path/to/destination')
  .demand(1)
  .argv;

var ROOT = path.join(__dirname, '..', '..');
var BUILD_DIR = argv._[0];
var DEBUG = true;

browserify({
  entries: ['js/app.js'],
  cacheFile: 'build-cache/app-browserify-incremental-cache.json',
  debug: DEBUG,
  baseDir: ROOT,
})
.bundle()
.on('error', function(error) {
  // Remove ROOT from the error message to make it more easily readable.
  error.message = error.message.split(ROOT).join('');
  console.log(error);
  this.end();
})
.pipe(source('bundle.js'))
.pipe(vfs.dest(BUILD_DIR));
