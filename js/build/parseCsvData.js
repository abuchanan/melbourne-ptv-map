var fs = require('fs');
var csv = require('csv-string');

var ROUTE_TYPES = [
  'tram',
  'subway',
  'rail',
  'bus',
  'ferry',
  'cablecar',
  'gondola',
  'funicular'
];


function parseCsvFile(parseRow, path) {
  var contents = fs.readFileSync(path).toString();
  var rows = csv.parse(contents);
  var records = [];

  // Header row is skipped
  for (var i = 1; i < rows.length; i++) {
    var record = parseRow(rows[i]);
    records.push(record);
  }
  return records;
}


function parseRouteRow(row) {
  var type_id = parseInt(row[4]);
  var type = ROUTE_TYPES[type_id];

  return {
    id: row[0],
    agency_id: row[1],
    short_name: row[2],
    long_name: row[3],
    type: type,
  };
}


function parseShapeRow(row) {
  return {
    id: row[0],
    latitude: parseFloat(row[1]),
    longitude: parseFloat(row[2]),
    sequence: parseInt(row[3]),
    distance_traveled: parseFloat(row[4])
  };
}


function parseTripRow(row) {
  return {
    route_id: row[0],
    service_id: row[1],
    id: row[2],
    shape_id: row[3],
    headsign: row[4],
    direction: parseInt(row[5])
  };
}


module.exports = {
  parseRoutesFile: parseCsvFile.bind(null, parseRouteRow),
  parseShapesFile: parseCsvFile.bind(null, parseShapeRow),
  parseTripsFile: parseCsvFile.bind(null, parseTripRow),
}
