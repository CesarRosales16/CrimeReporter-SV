var map = L.map('map', {
    center: [13.8333, -88.9167], // EDIT latitude, longitude to re-center map
    zoom: 9,  // EDIT from 1 to 18 -- decrease to zoom out, increase to zoom in
    scrollWheelZoom: true,
    tap: true
  });

  /* Control panel to display map layers */
  var controlLayers = L.control.layers(null, null, {
    position: "topright",
    collapsed: false
  }).addTo(map);

  // display Carto basemap tiles with light features and labels
  var light = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
  }).addTo(map); // EDIT - insert or remove ".addTo(map)" before last semicolon to display by default}

  
 
  var geojson = L.geoJson(data).addTo(map);

  var info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };


  info.update = function (props) {
    this._div.innerHTML = '<h4> Homicidio por Arma de fuego</h4>' + (props ?
      '<b>' + props.NOM_MUN + '</b><br />' + (props["2008_AF_2008"] ? props["2008_AF_2008"] : 0 ) + ' personas'
      : 'Hover over a state');
  };

  info.addTo(map);

  function getColor(d) {
    return d < 1 ? '#800026' :
      d < 2 ? '#BD0026' :
      d < 3 ? '#E31A1C' :
      d < 4 ? '#FC4E2A' :
      d < 7 ? '#FD8D3C' :
      d < 10 ? '#FEB24C' :
      d == "null" ? '#FED976' :
      '#FFEDA0';
  }

  function style(feature) {
    return {
      fillColor: getColor(feature.properties["2008_AF_2008"]),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }
  
  function style2(feature) {
    return {
      fillColor: getColor(feature.properties.Homicidi_2),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }

  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }

    info.update(layer.feature.properties);
  }


  var geojson, geojson2;

  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    geojson2.resetStyle(e.target);
    info.update();
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }

  geojson = L.geoJson(data, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);

  
  geojson2 = L.geoJson(data, {
    style: style2,
    onEachFeature: onEachFeature
  }).addTo(map);

  controlLayers.addBaseLayer(geojson, 'Carto  basemap');
  controlLayers.addBaseLayer(geojson2, 'Carto  basemap');

  map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');

  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [1, 2, 3, 4, 7, 10, 500, 1000],
      labels = [],
      from, to;

    for (var i = 0; i < grades.length; i++) {
      from = grades[i];
      to = grades[i + 1];

      labels.push(
        '<i style="background:' + getColor(from + 1) + '"></i> ' +
        from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
  };

  legend.addTo(map);

  // b arma fuego   3500   f  1381  estrang   o  cortocondundente 3588   v contundente 1966 