var fs = require('fs');
var path = require('path');
var AdmZip = require('adm-zip');
var yargs = require('yargs');

var argv = yargs
  .usage('Usage: $0 path/to/raw_data/gtfs.zip')
  .demand(1)
  .argv;

var topLevelZipPath = argv._[0];
var destDirectory = path.dirname(topLevelZipPath);


function extract(src, dest) {
  console.log("Extracting:", src);
  var zip = new AdmZip(src);
  zip.extractAllTo(dest);
}

function extractPart(partNum) {
  var zipPath = path.join(destDirectory, partNum, 'google_transit.zip');
  var destPath = path.join(destDirectory, partNum);
  return extract(zipPath, destPath)
}


extract(topLevelZipPath, destDirectory);
extractPart('1');
extractPart('2');
extractPart('3');
extractPart('4');
extractPart('5');
extractPart('6');
extractPart('7');
extractPart('8');
extractPart('10');
extractPart('11');
