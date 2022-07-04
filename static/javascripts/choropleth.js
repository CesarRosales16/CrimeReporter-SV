const loader = document.querySelector(".preload");
const mainmap = document.querySelector("#map");

//Función que inicializa preloader
function init() {
  setTimeout(() => {
    loader.style.opacity = 0;
    loader.style.display = "none";

    setTimeout(() => (mainmap.style.opacity = 1), 50);
  }, 1500);
}

init();

//Centrar el mapa con las coordenadas de El Salvador
var map = L.map("map", {
  center: [13.8333, -88.9167],
  zoom: 9,
  scrollWheelZoom: true,
  tap: true,
});

//Define que mapa se utilizará, en este caso Carto
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution:
    ' | Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
}).addTo(map);

//Posicionar logo en parte superior derecha del mapa
var logo = L.control({ position: "topright" });
logo.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info");
  div.innerHTML +=
    '<h2>   <img src="../static/img/CrimeReporterLOGO.png" alt="CrimeReporterLOGO" width="180" height="40">   </h2 Registro de delitos en El Salvador';
  return div;
};
logo.addTo(map);

//Controla la información que se desplega
var info = L.control();

//Indica capa base e inicial del mapa
var currentLayer = "";

//Convierte valores null a 0
const validValue = (value) => (value ? parseInt(value) : 0);

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();
  return this._div;
};

//Controla que capa se selecciona para ser representada en el mapa
const getCurrentLayer = (props) => {
  const labels = currentLayer.split(" ");
  switch (labels.length) {
    case 1:
      return validValue(props["PREDICTION"]);
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

//Actualiza la información del municipio y el total de casos al seleccionar una capa
info.update = function (props) {
  const selectedLayer = props && getCurrentLayer(props);
  this._div.innerHTML =
    `<h4>${currentLayer}</h4>` +
    (props
      ? "<b>" + props.NOM_MUN + "</b><br />" + selectedLayer + " persona(s)"
      : "Colocar cursor sobre municipio ");
};

//Función que recibe el total de casos por homicidios y le asigna un color al municipio de acuerdo al numero
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

//Función que asigna el color que tomará el municipio según el total de casos en este
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

//Función que al posicionar el cursor sobre un municipio, cambia el estilo de este
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

//Función que cambia el estilo del mapa, según la capa seleccionada
function resetHighlight({ target }) {
  geojsonBase.resetStyle(target);
  geojsonAuxiliar.resetStyle(target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

//Función que asigna propiedades para destacar y zoom
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

//geoJason que recibe la data y la coloca en el mapa
geojsonBase = L.geoJson(delitos, {
  style: style,
  onEachFeature: onEachFeature,
});

map.on("baselayerchange", function ({ layer }) {
  currentLayer = document
    .querySelector(
      `input[class="leaflet-control-layers-selector"]:checked + span`
    )
    .innerHTML.trim();
  console.log(currentLayer.split(" "));
  layer.setStyle(style);
});

//geoJason que recibe la data y la coloca en el mapa
geojsonAuxiliar = L.geoJson(delitos, {
  style: style,
  onEachFeature: onEachFeature,
});

var dropdown_etiquetas = [];

//Función que crea un dropdown desde 2008 hasta 2018 con la información correspondiente
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

//Se agrega solo para el año 2022 el mes de junio
dropdown_etiquetas.push({
  label: `Junio 2022`,
  collapsed: true,
  children: [
    { label: `Homicidio 2022`, layer: geojsonBase },

  ],
});


L.control.layers.tree(dropdown_etiquetas).addTo(map);

info.addTo(map);

//Leyenda para representación de totales de delitos
var legend_categorias = L.control({ position: "topleft" });

legend_categorias.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend_categorias"),
    grades = [0, 1, 2, 3, 4, 7, 10, 200, 500],
    labels = [" <h3> <strong> Categorías </strong>   </h3> <br>"],
    from,
    to;

  for (var i = 0; i < grades.length - 1; i++) {
    from = grades[i];
    to = grades[i + 1];
    labels.push(
      '<i style="background:' +
        getColor(from) +
        '" ></i> ' +
        "<p> " +
        from +
        (to ? " &ndash; " + to : "+") +
        "</p> " +
        " <br> "
    );
  }
  div.innerHTML = labels.join("");

  return div;
};

legend_categorias.addTo(map);

//Leyenda informativa de abreviaciones usadas en capas
var legend_description = L.control({ position: "topleft" });

legend_description.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend_description"),
    labels = [' <h3 class="title_legend"> <strong> LEYENDA </strong>   </h3>'];

  labels.push(
    "<p> " +
      "OC: Obj. Contundente" +
      "</p> " +
      "<p> " +
      "AF: Arma de Fuego" +
      "</p> " +
      "<p> " +
      "CC: Cortocontundente" +
      "</p> " +
      "<p> " +
      "AE: Estrangulamiento" +
      "</p> "
  );
  div.innerHTML = labels.join("");

  return div;
};

legend_description.addTo(map);

//Botón que inicializa Ventana Model
var button = L.control({ position: "bottomright" });

button.onAdd = function (map) {
  var div = L.DomUtil.create("div", ""),
    boton = [
      ' <a href="#" class="float"> <i class="fa fa-plus my-float"></i> </a>',
    ];
  div.innerHTML = boton.join("");
  return div;
};

button.addTo(map);

var btnOpenModal = document.querySelector(".float");
var modal = document.querySelector(".modal");
var backdrop = document.querySelector(".backdrop");
var cancelButton = document.querySelector(".btn-cancel");
var toggle = document.querySelector(".leaflet-control-layers.leaflet-control");
var legend_derecha = document.querySelector(".leaflet-top.leaflet-right");
var legend_izquierda = document.querySelector(".leaflet-top.leaflet-left");
var fab = document.querySelector(".float");
var btn_predecir = document.querySelector(".btn-confirm");
var selected_year = document.querySelector(".yearpicker.form-control.picker-input");
var loader_response = document.querySelector(".loading-response");
console.log(loader_response);

function closeModal() {
  modal.style.display = "none";
  backdrop.style.display = "none";
  legend_derecha.style.display = "block";
  legend_izquierda.style.display = "block";
  fab.style.display = "block";
}

function openModal() {
  modal.style.display = "flex";
  modal.style.flexDirection = "column";
  modal.style.alignItems = "center";
  backdrop.style.display = "block";
  legend_derecha.style.display = "none";
  legend_izquierda.style.display = "none";
  fab.style.display = "none";
}

function openLoader(){
  loader_response.classList.add("display");
}

function closeLoader(){
  loader_response.classList.remove("display");
}

$(document).ready(function () {
  $(".yearpicker").yearpicker({
    year: 2021,
    startYear: 2021,
    endYear: 2100,
  });
});

let response = delitos;

function predecir() {
  const year = `[{"year": ${selected_year.value}}]`;
  openLoader();
  axios
    .post("/predict", JSON.parse(year))
    .then(function ({ data }) {
      mapPrediction(data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

let geojsonPrediction;

function mapPrediction(prediction) {
  prediction.forEach((p) => {
    response.features.forEach((f) => {
      const { properties } = f;
      if (
        properties["NOM_DPTO"] === p["nom_dpto"] &&
        properties["NOM_MUN"] === p["nom_mun"]
      ) {
        f.properties["PREDICTION"] = p["total"];
        return;
      }
    });
  });
  currentLayer = "Prediction"
  geojsonPrediction = L.geoJson(response, {
    style: style,
    onEachFeature: onEachFeature,
  }).addTo(map);
  closeLoader();
  closeModal()
}

btn_predecir.addEventListener("click", predecir);
cancelButton.addEventListener("click", closeModal);
btnOpenModal.addEventListener("click", openModal);