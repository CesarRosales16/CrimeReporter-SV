const loader = document.querySelector('.preload');
const mainmap = document.querySelector('#map');

function init() {
  setTimeout(() => {
    loader.style.opacity = 0;
    loader.style.display = 'none';

    setTimeout(() => (mainmap.style.opacity = 1
    ), 50);
  }, 1500);
}

init()

var map = L.map("map", {
  center: [13.8333, -88.9167],
  zoom: 9,
  scrollWheelZoom: true,
  tap: true,
});

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution:
    ' | Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
}).addTo(map);

var logo = L.control({ position: "topright" });
logo.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info');
  div.innerHTML +=
    '<h2>   <img src="./img/CrimeReporterLOGO.png" alt="CrimeReporterLOGO" width="180" height="40">   </h2 Registro de delitos en El Salvador';
  return div;
};
logo.addTo(map);


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

function getColor(density) {
  return density < 1
    ? "#eddd95"
    : density < 2
      ? "#FEB24C"
      : density < 3
        ? "#FD8D3C"
        : density < 4
          ? "#FC4E2A"
          : density < 7
            ? "#BD0026"
            : density < 15
              ? "#800026"
              : density < 200
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

var dropdown_etiquetas = [];

for (let year = 2008; year <= 2018; year++) {
  dropdown_etiquetas.push({
    label: `${year}`,
    collapsed: true,
    children: [
      { label: `Homicidio ${year}`, layer: geojsonBase },
      { label: `Homicidio OC ${year}`, layer: geojsonAuxiliar },
      { label: `Homicidio AF ${year}`, layer: geojsonAuxiliar },
      { label: `Homicidio CC ${year}`, layer: geojsonAuxiliar },
      { label: `Homicidio AE ${year}`, layer: geojsonAuxiliar },
    ],
  });
}

L.control.layers.tree(dropdown_etiquetas).addTo(map);

info.addTo(map);

var legend_categorias = L.control({ position: "topleft" });

legend_categorias.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend_categorias"),
    grades = [0, 1, 2, 3, 4, 7, 10, 200, 400],
    labels = [' <h3> <strong> Categorías </strong>   </h3> <br>'],
    from,
    to;

  for (var i = 0; i < grades.length - 1; i++) {
    from = grades[i];
    to = grades[i + 1];
    labels.push(
      '<i style="background:' +
      getColor(from) +
      '" ></i> ' + '<p> ' +
      from +
      (to ? " &ndash; " + to : "+") + '</p> ' + ' <br> '
    );
  }
  div.innerHTML = labels.join('');

  return div;
};

legend_categorias.addTo(map);


var legend_description = L.control({ position: "topleft" });

legend_description.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend_description"),
    labels = [' <h3 class="title_legend"> <strong> LEYENDA </strong>   </h3>'];

  labels.push('<p> ' + 'OC: Obj. Contundente' + '</p> ' + '<p> ' +
   'AF: Arma de Fuego' + '</p> ' + '<p> ' + 'CC: Cortocontundente' + 
   '</p> ' + '<p> ' + 'AE: Estrangulamiento' + '</p> ');
  div.innerHTML = labels.join('');

  return div;
};

legend_description.addTo(map);

var button = L.control({ position: "bottomright" });

button.onAdd = function (map) {
  var div = L.DomUtil.create("div", ""),
  boton = [' <a href="#" class="float"> <i class="fa fa-plus my-float"></i> </a>'];
  div.innerHTML = boton.join('');
  return div;
}

button.addTo(map);