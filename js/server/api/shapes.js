module.exports = function(db) {
  return function(request, response) {

    db
    .from('best_route_shapes')
    .join('shapes', 'best_route_shapes.shape_id', '=', 'shapes.id')
    .select('shape_id', 'shapes.longitude as longitude', 'shapes.latitude as latitude')
    .then(function(rows) {

      var features = {};
      var features_list = [];

      function get_or_create_feature(id) {
        var feature = features[id];
        if (feature === undefined) {
          feature = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [],
            },
            properties: {
              shape_id: id,
            }
          }
          features[id] = feature;
          features_list.push(feature);
        }
        return feature;
      }

      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var c = [row.longitude, row.latitude];
        var feature = get_or_create_feature(row.shape_id);
        feature.geometry.coordinates.push(c);
      }

      response.json({
        type: "FeatureCollection",
        features: features_list,
      });
    })
    .catch(function(error) {
      // TODO
      console.log(error);
    });
  }
};
