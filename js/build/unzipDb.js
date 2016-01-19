var fs = require('fs');
var path = require('path');
var yargs = require('yargs');
var zlib = require('zlib');

var argv = yargs
  .usage('Usage: $0 path/to/file.gz')
  .demand(1)
  .argv;

var filePath = argv._[0];
var outputPath = filePath.replace('.gz', '');

fs.createReadStream(filePath)
.pipe(zlib.createGunzip())
.pipe(fs.createWriteStream(outputPath));
