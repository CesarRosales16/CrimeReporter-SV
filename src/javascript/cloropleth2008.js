var map = L.map("map", {
  center: [13.8333, -88.9167], // EDIT latitude, longitude to re-center map
  zoom: 9, // EDIT from 1 to 18 -- decrease to zoom out, increase to zoom in
  scrollWheelZoom: true,
  tap: true,
});

/* Control panel to display map layers */
var controlLayers = L.control
  .layers(null, null, {
    position: "topright",
    collapsed: false,
  })
  .addTo(map);

// display Carto basemap tiles with light features and labels
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
}).addTo(map); // EDIT - insert or remove ".addTo(map)" before last semicolon to display by default}

var info = L.control();

var currentLayer = "Homicidio 1";

const validValue = (value) => (value ? value : 0);

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();
  return this._div;
};

const getCurrentLayer = (props) => {
  switch (currentLayer) {
    case "Homicidio 1":
      return validValue(props.Homicidi_1);
    default:
      return validValue(props.Homicidi_2);
  }
};

info.update = function (props) {
  const selectedLayer = props && getCurrentLayer(props);
  this._div.innerHTML =
    `<h4>${currentLayer}</h4>` +
    (props
      ? "<b>" + props.nom_mun + "</b><br />" + selectedLayer + " persona(s)"
      : "Hover over a state");
};

function getColor(d) {
  return d < 1
    ? "#800026"
    : d < 2
    ? "#BD0026"
    : d < 3
    ? "#E31A1C"
    : d < 4
    ? "#FC4E2A"
    : d < 7
    ? "#FD8D3C"
    : d < 10
    ? "#FEB24C"
    : "#FFEDA0";
}

function style({ properties }) {
  return {
    fillColor: getColor(getCurrentLayer(properties)),
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

function highlightFeature({ target }) {
  var layer = target;

  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
  info.update(layer.feature.properties);
}

var geojson, geojson2;

function resetHighlight({ target }) {
  geojson.resetStyle(target);
  geojson2.resetStyle(target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

geojson = L.geoJson(data2008, {
  style: style,
  onEachFeature: onEachFeature,
}).addTo(map);

map.on("baselayerchange", function ({ target, name }) {
  currentLayer = name;
  info.update();
});

geojson2 = L.geoJson(data2008, {
  style: style,
  onEachFeature: onEachFeature,
});

L.control
  .layers({ "Homicidio 1": geojson, "Homicidio 2": geojson2 }, null, {
    position: "topright",
    collapsed: false,
  })
  .addTo(map);

map.attributionControl.addAttribution(
  'Population data &copy; <a href="http://census.gov/">US Census Bureau</a>'
);

info.addTo(map);

var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend"),
    grades = [1, 2, 3, 4, 7, 10, 500, 1000],
    labels = [],
    from,
    to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' +
        getColor(from + 1) +
        '"></i> ' +
        from +
        (to ? "&ndash;" + to : "+")
    );
  }

  div.innerHTML = labels.join("<br>");
  return div;
};

legend.addTo(map);

// b arma fuego   3500   f  1381  estrang   o  cortocondundente 3588   v contundente 1966
