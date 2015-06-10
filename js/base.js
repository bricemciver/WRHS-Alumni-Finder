var DATA_SERVICE_URL = "https://script.google.com/macros/s/AKfycbze__bUeh_ZiI2YzKwUaClBkfXbnaMtjo_2cA8Z1voxzpudVg/exec";
var AUTO_ZOOM = 14;
var DEFAULT_ZOOM;
var DEFAULT_CENTER;
var map;
var markers;
var geojson;
var info;
var search;
var searchArray = [];

function initializeMap() {
    map = L.map('map').setView([37.8, -96], 5);

    L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>',
        subdomains: '1234'
    }).addTo(map);

    markers = L.markerClusterGroup({
        showCoverageOnHover: false
    });

    search = L.control({position:'topleft'});

    search.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'ui-search');
        this._div.innerHTML = '<input id="search"/>';
        return this._div;
    };

    search.addTo(map);

    info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        var popupContent = '<h4>Hover over a marker</h4>';
        if (props) {
            popupContent = '<strong>' + props.firstName + ' ';
            if (props.maidenName && props.maidenName !== props.lastName) {
                popupContent += '(' + props.maidenName + ') ';
            }
            popupContent += props.lastName + '</strong><br/>';
            popupContent += props.address + '<br/>';
            popupContent += props.city + ', ' + props.state + ' ' + props.zip + '<br/>';
            popupContent += '<a href="mailto:' + props.email + '">' + props.email + '</a><br/>';
            popupContent += props.phone;
        }

        this._div.innerHTML = popupContent;
    };

    info.addTo(map);
}

function checkPassword(password) {
    var expectedPassword = [1675120786,1692610681,1777672631,-1813029098,-1341260827,-1647762853,257417061,-1933570901];
    var parsedPassword = sjcl.misc.pbkdf2(password, 'A3F7610999D65B3E', 1000, 256);
    if (JSON.stringify(parsedPassword) === JSON.stringify(expectedPassword)) {
        debugger;
        $('.passwordErrorText').text('');
        $.ajax({
            url: DATA_SERVICE_URL,
            dataType: 'json'
        }).done(function (data) {
            geojson = L.geoJson(data, {
                style: style,
                onEachFeature: onEachFeature,
                pointToLayer: pointToLayer
            });
            map.fitBounds(geojson.getBounds(), {
                padding: [60, 60]
            });
            DEFAULT_ZOOM = map.getZoom();
            DEFAULT_CENTER = map.getCenter();
            markers.addLayer(geojson);
            markers.addTo(map);
            $('.passwordEntry').remove();
        });
    } else {
        $('.passwordErrorText').text('Wrong password.');
    }
}

function style(feature) {
    return {
        radius: 8,
        fillColor: '#015EA7',
        color: 'white',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7
    };
}

function onEachFeature(feature, layer) {
    var props = feature.properties;
    var label = props.firstName + ' ';
    if (props.maidenName && props.maidenName !== props.lastName) {
     label += '(' + props.maidenName + ') ';
    }
    label += props.lastName;
    var desc = props.address;
    if (props.address) {
        desc += ', ';
    }
    desc += props.city;
    if (props.city) {
        desc += ', ';
    }
    desc += props.state;
    searchArray.push({
        value: feature.id,
        label: label,
        desc: desc,
        latlng: layer.getLatLng()
    });
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    })
}

function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng, style(feature));
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666'
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.setView(e.target.getLatLng(), AUTO_ZOOM);
}

$(document).ready(function () {
    initializeMap();
    $('#search').autocomplete({
        minLength: 0,
        source: searchArray,
        focus: function(event, ui) {
            $("#search").val(ui.item.label);
            return false;
        },
        select: function(event, ui) {
            $("#search").val(ui.item.label + ", " + ui.item.desc);
            map.setView(ui.item.latlng, AUTO_ZOOM);
            return false;
        }
    }).autocomplete("instance")._renderItem = function(ul, item) {
        return $("<li>").append("<a><span class='name'>" + item.label + "</span><br><span class='address'>" + item.desc + "</span></a>").appendTo(ul);
    };
    $('#password').on("keydown", function(e) {
        if (e.keyCode == 13) {
            checkPassword($('#password').val());
        }
    })
});