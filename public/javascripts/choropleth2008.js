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

var currentLayer = "Homicidio 2008";

const validValue = (value) => (value ? parseInt(value) : 0);

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();
  return this._div;
};

const getCurrentLayer = (props) => {
  switch (currentLayer) {
    case "Homicidio 2008":
      return (
        validValue(props["2008_OC_2008"]) +
        validValue(props["2008_AF_2008"]) +
        validValue(props["2008_AE_2008"]) +
        validValue(props["2008_CC_2008"])
      );
    case "Homicidio OC 2008":
      return validValue(props["2008_OC_2008"]);
    case "Homicidio AF 2008":
      return validValue(props["2008_AF_2008"]);
    case "Homicidio CC 2008":
      return validValue(props["2008_CC_2008"]);
    case "Homicidio AE 2008":
      return validValue(props["2008_AE_2008"]);
    case "Homicidio 2009":
      return (
        validValue(props["2009_OC_2009"]) +
        validValue(props["2009_AF_2009"]) +
        validValue(props["2009_AE_2009"]) +
        validValue(props["2009_CC_2009"])
      );
    case "Homicidio OC 2009":
      return validValue(props["2009_OC_2009"]);
    case "Homicidio AF 2009":
      return validValue(props["2009_AF_2009"]);
    case "Homicidio CC 2009":
      return validValue(props["2009_CC_2009"]);
    case "Homicidio AE 2009":
      return validValue(props["2009_AE_2009"]);
    case "Homicidio 2010":
      return (
        validValue(props["2010_OC_2010"]) +
        validValue(props["2010_AF_2010"]) +
        validValue(props["2010_AE_2010"]) +
        validValue(props["2010_CC_2010"])
      );
    case "Homicidio OC 2010":
      return validValue(props["2010_OC_2010"]);
    case "Homicidio AF 2010":
      return validValue(props["2010_AF_2010"]);
    case "Homicidio CC 2010":
      return validValue(props["2010_CC_2010"]);
    case "Homicidio AE 2010":
      return validValue(props["2010_AE_2010"]);
    default:
      return validValue(props["2009_CC_2009"]);
  }
};

info.update = function (props) {
  const selectedLayer = props && getCurrentLayer(props);
  this._div.innerHTML =
    `<h4>${currentLayer}</h4>` +
    (props
      ? "<b>" + props.NOM_MUN + "</b><br />" + selectedLayer + " persona(s)"
      : "Hover over a state");
};

function getColor(d) {
  return d < 1
    ? "#eddd95"
    : d < 2
    ? "#FEB24C"
    : d < 3
    ? "#FD8D3C"
    : d < 4
    ? "#FC4E2A"
    : d < 7
    ? "#BD0026"
    : d < 15
    ? "#800026"
    : d < 200
    ? "#660320"
    : "#360111";
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

var geojsonBase, geojsonAuxiliar;

function resetHighlight({ target }) {
  geojsonBase.resetStyle(target);
  geojsonAuxiliar.resetStyle(target);
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

geojsonBase = L.geoJson(data, {
  style: style,
  onEachFeature: onEachFeature,
}).addTo(map);

map.on("baselayerchange", function ({ layer }) {
  currentLayer = document
    .querySelector(
      `input[class="leaflet-control-layers-selector"]:checked + span`
    )
    .innerHTML.trim();
  layer.setStyle(style);
});

geojsonAuxiliar = L.geoJson(data, {
  style: style,
  onEachFeature: onEachFeature,
});

var capas = {
  "Homicidio 2008": geojsonBase,
  "Homicidio OC": geojsonAuxiliar,
  "Homicidio AF": geojsonAuxiliar,
  "Homicidio CC": geojsonAuxiliar,
  "Homicidio AE": geojsonAuxiliar,
};

var baseTree = [
  {
    label: "2008",
    collapsed: true,
    children: [
      { label: "Homicidio 2008", layer: geojsonBase },
      { label: "Homicidio OC 2008", layer: geojsonAuxiliar },
      { label: "Homicidio AF 2008", layer: geojsonAuxiliar },
      { label: "Homicidio CC 2008", layer: geojsonAuxiliar },
      { label: "Homicidio AE 2008", layer: geojsonAuxiliar },
    ],
  },
  {
    label: "2009",
    collapsed: true,
    children: [
      { label: "Homicidio 2009", layer: geojsonAuxiliar },
      { label: "Homicidio OC 2009", layer: geojsonAuxiliar },
      { label: "Homicidio AF 2009", layer: geojsonAuxiliar },
      { label: "Homicidio CC 2009", layer: geojsonAuxiliar },
      { label: "Homicidio AE 2009", layer: geojsonAuxiliar },
    ],
  },
  {
    label: "2010",
    collapsed: true,
    children: [
      { label: "Homicidio 2010", layer: geojsonAuxiliar },
      { label: "Homicidio OC 2010", layer: geojsonAuxiliar },
      { label: "Homicidio AF 2010", layer: geojsonAuxiliar },
      { label: "Homicidio CC 2010", layer: geojsonAuxiliar },
      { label: "Homicidio AE 2010", layer: geojsonAuxiliar },
    ],
  },
];

L.control.layers.tree(baseTree).addTo(map);

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
