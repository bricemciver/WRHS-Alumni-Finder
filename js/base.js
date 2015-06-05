var DATA_SERVICE_URL = "https://script.google.com/macros/s/AKfycbze__bUeh_ZiI2YzKwUaClBkfXbnaMtjo_2cA8Z1voxzpudVg/exec";
var AUTO_ZOOM = 14;
var DEFAULT_ZOOM;
var DEFAULT_CENTER;
var map;
var markers;
// The markerClicked flag indicates whether a popup is open because the
// user clicked a marker. True means the user clicked a marker. False
// means the user simply hovered over the marker, or the user has closed the
// popup.
var markerClicked = false;
var previousName;

function initializeMap() {
    map = L.map('map');

    L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>',
        subdomains: '1234'
    }).addTo(map);

    map.on('popupclose', function() {
        markerClicked = false;
    });

    markers = L.markerClusterGroup({
        showCoverageOnHover: false
    });

    $.ajax({
        url: DATA_SERVICE_URL,
        dataType: 'json'
    }).done(function(data) {
        var geojson = L.geoJson(data, {
            onEachFeature: onEachFeature
        });
        map.fitBounds(geojson.getBounds(), {
            padding: [60,60],
            maxZoom: AUTO_ZOOM
        });
        DEFAULT_ZOOM = map.getZoom();
        DEFAULT_CENTER = map.getCenter();
        markers.addLayer(geojson);
        markers.addTo(map);
    });
}

function createPopupContent(feature) {
    var popupContent = '<strong>' + feature.properties.firstName + ' ';
    if (feature.properties.maidenName && feature.properties.maidenName !== feature.properties.lastName) {
        popupContent += '(' + feature.properties.maidenName + ') ';
    }
    popupContent += feature.properties.lastName + '</strong><br/>';
    popupContent += feature.properties.address + '<br/>';
    popupContent += feature.properties.city + ', ' + feature.properties.state + ' ' + feature.properties.zip + '<br/>';
    popupContent += '<a href="mailto:' + feature.properties.email + '">' + feature.properties.email + '</a><br/>';
    popupContent += feature.properties.phone;
    return popupContent;
}

function onEachFeature(feature, layer) {
    layer.bindPopup(createPopupContent(feature));
    layer.on({
        click: onClick,
        mouseover: onMouseOver,
        mouseout: onMouseOut
    });
}

// On click of marker, show the popup window and zoom in.
function onClick(e) {
    // Check whether the marker has been clicked already,
    // because we want to zoom out on second click of same marker.
    var layer = e.layer || e.target;
    var currentName = layer.feature.properties.email;
    if (currentName == previousName) {
        // This is the second click, so zoom back to user's previous zoom level.
        map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
        // Reset flags ready for next time round.
        previousName = '';
        markerClicked = false;
    } else {
        previousName = layer.feature.properties.email;

        // This is the first click, so show the popup window and zoom in.
        // Zoom in before opening the info window.
        // If the user has already zoomed in beyond our automatic zoom,
        // leave their zoom setting untouched.
        map.setView(e.latlng, Math.max(map.getZoom(), AUTO_ZOOM));

        // Open the info window and reset flag ready for next time round.
        layer.openPopup();
        markerClicked = true;
    }
}

function onMouseOver(e) {
    var layer = e.layer || e.target;
    layer.openPopup();
}

function onMouseOut(e) {
    if (!markerClicked) {
        map.closePopup();
    }
}

$(document).ready(function() {
    initializeMap();
});