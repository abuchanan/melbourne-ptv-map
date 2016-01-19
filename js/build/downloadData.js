var fs = require('fs');
var request = require('request');
var path = require('path');
var yargs = require('yargs');

var argv = yargs
  .usage('Usage: $0 path/to/destination')
  .demand(1)
  .argv;

var dataDirectory = argv._[0];
var dataDownloadPath = path.join(dataDirectory, 'gtfs.zip');
var dataUrl = 'http://data.ptv.vic.gov.au/downloads/gtfs.zip';

fs.exists(dataDownloadPath, function(exists) {
  if (exists) {
    console.log("GTFS data already exists.")
    return;
  }

  console.log("Downloading PTV GTFS data to", dataDownloadPath);

  var file = fs.createWriteStream(dataDownloadPath);

  request.get(dataUrl)
  .pipe(file)
  .on('error', function(error) {
    fs.unlink(dataDownloadPath);
    console.error(error);
  })
  .on('end', function() {
    console.log('end');

  });
});
