module.exports = function(db) {
  return function(request, response) {

    db
    .from('shapes')
    .select("longitude", "latitude")
    .where({id: request.params.shapeId})
    .then(function(rows) {

      var coordinates = [];
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        coordinates.push([row.longitude, row.latitude]);
      }

      response.json({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coordinates
        }
      });
    })
    .catch(function(error) {
      // TODO
      console.log(error);
    });
  }
};
