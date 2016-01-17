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


function parse_csv_file(parse_row, path) {
  var contents = fs.readFileSync(path).toString();
  var rows = csv.parse(contents);
  var records = [];

  // Header row is skipped
  for (var i = 1; i < rows.length; i++) {
    var record = parse_row(rows[i]);
    records.push(record);
  }
  return records;
}


function parse_route_row(row) {
  var type_id = parseInt(row[4]);
  var type = ROUTE_TYPES[type_id];

  return {
    id: row[0],
    short_name: row[2],
    long_name: row[3],
    type: type,
  };
}


function parse_shape_row(row) {
  return {
    id: row[0],
    latitude: parseFloat(row[1]),
    longitude: parseFloat(row[2]),
  };
}


function parse_trip_row(row) {
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
  parse_route_file: parse_csv_file.bind(null, parse_route_row),
  parse_shape_file: parse_csv_file.bind(null, parse_shape_row),
  parse_trip_file: parse_csv_file.bind(null, parse_trip_row),
}
