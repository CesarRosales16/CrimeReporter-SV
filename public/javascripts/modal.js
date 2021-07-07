var btnOpenModal = document.querySelector('.float');
var modal = document.querySelector('.modal');
var backdrop = document.querySelector('.backdrop');
var cancelButton = document.querySelector('.btn-cancel');
var toggle = document.querySelector(".leaflet-control-layers.leaflet-control");
var legend_derecha = document.querySelector(".leaflet-top.leaflet-right");
var legend_izquierda = document.querySelector(".leaflet-top.leaflet-left");
var fab = document.querySelector(".float");

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
       startYear: 2019,
       endYear: 2050,
    });
 });

static();

cancelButton.addEventListener("click", closeModal);
btnOpenModal.addEventListener("click", openModal);
toggle.addEventListener("mouseover", static, false);
toggle.addEventListener("mouseout", static, false);

