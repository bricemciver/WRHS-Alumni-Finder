var DATA_SERVICE_URL = "https://script.google.com/macros/s/AKfycbze__bUeh_ZiI2YzKwUaClBkfXbnaMtjo_2cA8Z1voxzpudVg/exec";
var map = L.map('map');

L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>',
    subdomains: '1234'
}).addTo(map);

function onEachFeature(feature, layer) {
    var popupContent = '<strong>' + feature.properties.firstName + ' ';
    if (feature.properties.maidenName && feature.properties.maidenName !== feature.properties.lastName) {
        popupContent += '(' + feature.properties.maidenName + ') ';
    }
    popupContent += feature.properties.lastName + '</strong><br/>';
    popupContent += feature.properties.address + '<br/>';
    popupContent += feature.properties.city + ', ' + feature.properties.state + ' ' + feature.properties.zip + '<br/>';
    popupContent += '<a href="mailto:' + feature.properties.email + '">' + feature.properties.email + '</a><br/>';
    popupContent += feature.properties.phone;

    layer.bindPopup(popupContent);
}

$.ajax({
    url: DATA_SERVICE_URL,
    dataType: 'json'
}).done(function(data) {
    var geojson = L.geoJson(data, {
        onEachFeature: onEachFeature
    });
    map.fitBounds(geojson.getBounds());
    geojson.addTo(map);
});