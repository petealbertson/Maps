// Load the following when page is ready (sans jQuery)
document.addEventListener('DOMContentLoaded', function(){
    var mapID = "map";
    var mapBoxID = "petealbertson.hc43hj5e";

    var startingLatLong = [41.888569, -87.635528];
    var startingZoom = 14;
    var myGeoControl = L.mapbox.geocoderControl(mapBoxID);
    window.data = [];
    // Initialize the map.
    var map = L.mapbox.map(mapID, mapBoxID)
        .setView(startingLatLong, startingZoom)
        .addControl(myGeoControl);

        myGeoControl.on('found', function(theResult){
            var newList = _.map(data, function(object, key){
                object['distance'] = window.distance(theResult.latlng, [object.latitude, object.longitude]);
                return object;
            });
            var closestList = _.sortBy(newList, function(object) { return object.distance; });
            alert("You are closest to " + closestList[0].location + "! Get some veggies.");
        });

    // Get JSON data from Data Portal. (The following is instead of $.getJSON)
    // Source: https://data.cityofchicago.org/Environment-Sustainable-Development/Farmers-Markets-2013/i8y3-ytj4

    request = new XMLHttpRequest();
    request.open('GET', 'http://data.cityofchicago.org/resource/i8y3-ytj4.json', true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400){
        // Success!
         data = JSON.parse(request.responseText);

        // Loop through the data
            // … and update the map
        var points = []
        _.each(data, function(element, index, list) {
            // console.log(element)
            var lat = element['latitude']
            var lon = element['longitude']
            L.mapbox.featureLayer({
            // this feature is in the GeoJSON format: see geojson.org
            // for the full specification
            type: 'Feature',
            geometry: {
            type: 'Point',
            // coordinates here are in longitude, latitude order because
            // x, y is the standard for GeoJSON and many formats
            coordinates: [lon, lat]
            },
            properties: {
            title: element['location'],
            description: element.intersection,
            // one can customize markers by adding simplestyle properties
            // http://mapbox.com/developers/simplestyle/
            'marker-size': 'large',
            'marker-color': '#f0a'
            }

            }).addTo(map);
        });

      } else {
        // We reached our target server, but it returned an error
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
    };

    request.send();
});

window.distance = function(start, end) {
    // Assumes start & end are in [lat, long] format
    return Math.sqrt(Math.pow(start[0] - end[0], 2) + Math.pow(start[1] - end[1], 2));
};
