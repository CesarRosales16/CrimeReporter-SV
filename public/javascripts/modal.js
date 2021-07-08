var btnOpenModal = document.querySelector('.float');
var modal = document.querySelector('.modal');
var backdrop = document.querySelector('.backdrop');
var cancelButton = document.querySelector('.btn-cancel');
var toggle = document.querySelector(".leaflet-control-layers.leaflet-control");
var legend_derecha = document.querySelector(".leaflet-top.leaflet-right");
var legend_izquierda = document.querySelector(".leaflet-top.leaflet-left");
var fab = document.querySelector(".float");
var btn_predecir = document.querySelector(".btn-confirm");
var selected_year = document.querySelector(".yearpicker.form-control.picker-input")

function static() {
    toggle.classList.add("leaflet-control-layers-expanded");
}

function closeModal() {
  modal.style.display = 'none';
  backdrop.style.display = 'none';
  legend_derecha.style.display = 'block';
  legend_izquierda.style.display = 'block';
  fab.style.display = 'block';
}

function openModal() {
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column'
    modal.style.alignItems = 'center'
    backdrop.style.display = 'block';
    legend_derecha.style.display = 'none';
    legend_izquierda.style.display = 'none';
    fab.style.display = 'none';
}

$(document).ready(function() {
    $(".yearpicker").yearpicker({
       year: 2021,
       startYear: 2021,
       endYear: 2100,
    });
 });

static();

function predecir() {
    const year = [{"year": selected_year.value}]
    console.log(JSON.stringify(year))

    axios.post('https://choro-flask2.herokuapp.com/predict', JSON.stringify(year))
      .then(function (response) {
          console.log('Hola :)')
        console.log(response);
      })
      .catch(function (error) {
        console.log('Hola :(')
        console.log(error)
      });  
  }


btn_predecir.addEventListener("click", predecir);
cancelButton.addEventListener("click", closeModal);
btnOpenModal.addEventListener("click", openModal);
toggle.addEventListener("mouseover", static, false);
toggle.addEventListener("mouseout", static, false);

