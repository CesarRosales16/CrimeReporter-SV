var map = L.map("map", {
  center: [13.8333, -88.9167], // EDIT latitude, longitude to re-center map
  zoom: 9, // EDIT from 1 to 18 -- decrease to zoom out, increase to zoom in
  scrollWheelZoom: true,
  tap: true,
});

// display Carto basemap tiles with light features and labels
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
}).addTo(map); // EDIT - insert or remove ".addTo(map)" before last semicolon to display by default}

var title = L.control({ position: "topright" });
        title.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info');
            div.innerHTML +=
                '<h2>   <img src="./img/CrimeReporterLOGO.png" alt="CrimeReporterLOGO" width="330" height="60">   </h2 Registro de delitos en El Salvador' ;
            return div;
        };
        title.addTo(map);


var info = L.control();

var currentLayer = "Homicidio 2008";

const validValue = (value) => (value ? parseInt(value) : 0);

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();
  return this._div;
};

const getCurrentLayer = (props) => {
  const labels = currentLayer.split(" ");
  switch (labels.length) {
    case 2:
      return (
        validValue(props[`${labels[1]}_OC_${labels[1]}`]) +
        validValue(props[`${labels[1]}_AF_${labels[1]}`]) +
        validValue(props[`${labels[1]}_AE_${labels[1]}`]) +
        validValue(props[`${labels[1]}_CC_${labels[1]}`])
      );
    case 3:
      return validValue(props[`${labels[2]}_${labels[1]}_${labels[2]}`]);
    default:
      return;
  }
};

info.update = function (props) {
  const selectedLayer = props && getCurrentLayer(props);
  this._div.innerHTML =
    `<h4>${currentLayer}</h4>` +
    (props
      ? "<b>" + props.NOM_MUN + "</b><br />" + selectedLayer + " persona(s)"
      : "Colocar cursor sobre municipio ");
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
    color: "#450a0a",
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
  console.log(currentLayer.split(" "));
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
  {
    label: "2011",
    collapsed: true,
    children: [
      { label: "Homicidio 2011", layer: geojsonAuxiliar },
      { label: "Homicidio OC 2011", layer: geojsonAuxiliar },
      { label: "Homicidio AF 2011", layer: geojsonAuxiliar },
      { label: "Homicidio CC 2011", layer: geojsonAuxiliar },
      { label: "Homicidio AE 2011", layer: geojsonAuxiliar },
    ],
  },
  {
    label: "2012",
    collapsed: true,
    children: [
      { label: "Homicidio 2012", layer: geojsonAuxiliar },
      { label: "Homicidio OC 2012", layer: geojsonAuxiliar },
      { label: "Homicidio AF 2012", layer: geojsonAuxiliar },
      { label: "Homicidio CC 2012", layer: geojsonAuxiliar },
      { label: "Homicidio AE 2012", layer: geojsonAuxiliar },
    ],
  },
  {
    label: "2013",
    collapsed: true,
    children: [
      { label: "Homicidio 2013", layer: geojsonAuxiliar },
      { label: "Homicidio OC 2013", layer: geojsonAuxiliar },
      { label: "Homicidio AF 2013", layer: geojsonAuxiliar },
      { label: "Homicidio CC 2013", layer: geojsonAuxiliar },
      { label: "Homicidio AE 2013", layer: geojsonAuxiliar },
    ],
  },
  {
    label: "2014",
    collapsed: true,
    children: [
      { label: "Homicidio 2014", layer: geojsonAuxiliar },
      { label: "Homicidio OC 2014", layer: geojsonAuxiliar },
      { label: "Homicidio AF 2014", layer: geojsonAuxiliar },
      { label: "Homicidio CC 2014", layer: geojsonAuxiliar },
      { label: "Homicidio AE 2014", layer: geojsonAuxiliar },
    ],
  },
  {
    label: "2015",
    collapsed: true,
    children: [
      { label: "Homicidio 2015", layer: geojsonAuxiliar },
      { label: "Homicidio OC 2015", layer: geojsonAuxiliar },
      { label: "Homicidio AF 2015", layer: geojsonAuxiliar },
      { label: "Homicidio CC 2015", layer: geojsonAuxiliar },
      { label: "Homicidio AE 2015", layer: geojsonAuxiliar },
    ],
  },
  {
    label: "2016",
    collapsed: true,
    children: [
      { label: "Homicidio 2016", layer: geojsonAuxiliar },
      { label: "Homicidio OC 2016", layer: geojsonAuxiliar },
      { label: "Homicidio AF 2016", layer: geojsonAuxiliar },
      { label: "Homicidio CC 2016", layer: geojsonAuxiliar },
      { label: "Homicidio AE 2016", layer: geojsonAuxiliar },
    ],
  },
  {
    label: "2017",
    collapsed: true,
    children: [
      { label: "Homicidio 2017", layer: geojsonAuxiliar },
      { label: "Homicidio OC 2017", layer: geojsonAuxiliar },
      { label: "Homicidio AF 2017", layer: geojsonAuxiliar },
      { label: "Homicidio CC 2017", layer: geojsonAuxiliar },
      { label: "Homicidio AE 2017", layer: geojsonAuxiliar },
    ],
  },
  {
    label: "2018",
    collapsed: true,
    children: [
      { label: "Homicidio 2018", layer: geojsonAuxiliar },
      { label: "Homicidio OC 2018", layer: geojsonAuxiliar },
      { label: "Homicidio AF 2018", layer: geojsonAuxiliar },
      { label: "Homicidio CC 2018", layer: geojsonAuxiliar },
      { label: "Homicidio AE 2018", layer: geojsonAuxiliar },
    ],
  },
];



L.control.layers.tree(baseTree).addTo(map);

info.addTo(map);

var legend = L.control({ position: "topleft" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend"),
    grades = [0, 1, 2, 3, 4, 7, 10, 200, 1000],
    labels = [' <h3> <strong> Categorías </strong>   </h3> <br>'],
    from,
    to;

  for (var i = 0; i < grades.length-1; i++) {
    from = grades[i];
    to = grades[i + 1];
    console.log(from, to);
    labels.push(
      '<i style="background:' +
        getColor(from) +
        '" ></i> ' + '<p> '+ 
        from +
        (to ? " &ndash; " + to : "+") +  '</p> ' + ' <br> '
    );
  }
  console.log(labels)
  div.innerHTML = labels.join('');
  console.log(div.innerHTML)

  return div;
};

legend.addTo(map);

var toggle = document.querySelector(".leaflet-control-layers.leaflet-control");
static();

toggle.addEventListener("mouseover", static, false);
toggle.addEventListener("mouseout", static, false);

function static() {
  toggle.classList.add("leaflet-control-layers-expanded");
}



