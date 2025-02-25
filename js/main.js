// * Başlangıçta kullanıcının konuma erişmeliyiz.
// Bu sayede haritanın başlangıç konumunu belirleyeceğiz.

import { personIcon } from "./constants.js";
import { getNoteIcon, getStatus } from "./helpers.js";
import elements from "./ui.js";

// Global Değişkenler

var map;
let clickedCoords;
let layer;

// Localstorage'dan notes keyine sahip elemanları al
let notes = JSON.parse(localStorage.getItem("notes")) || [];

console.log(notes);

// window içerisindeki navigator objesi içerisinde kullanıcının
//  açmış olduğu sekme ile alakalı birçok veriyi bulundurur.
// (kordinat,tarayıcı ile alakalı veriler,pc ile alakalı veriler)
// Bizde bu yapı içerisindeki geolocation yapısıyla kordinat verisine eriştik.
// geolocation içerisindeki  getCurrentPosition kullanıcının  mevcut konumunu almak için kullanılır.
// Bu fonksiyon içerisine iki adet callBack fonksiyon ister.
// Birincisi kullanıcının konum bilgisini paylaşması durumunda çalışır ikincisi ise konum bilgisini
//  paylaşmaması durumunda çalışır.
window.navigator.geolocation.getCurrentPosition(
  (e) => {
    // Konum bilgisi paylaşıldığında
    loadMap([e.coords.latitude, e.coords.longitude], "Mevcut Konum");
  },
  (e) => {
    // Konum bilgisi paylaşılmadığında
    loadMap([41.039226343362486, 29.000641323770868], "Varsayılan Konum");
  }
);
//! Haritayı oluşturan Fonkisyon
function loadMap(currentPosition, msg) {
  map = L.map("map", {
    zoomControl: false,
  }).setView(currentPosition, 12);
  // Haritayı render eder
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Zoom araçlarının konumunu belirle
  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);

  // Ekrana basılacak bir katman oluştur

  layer = L.layerGroup().addTo(map);
  // Kullanıcının başlangıç konumuna bir tane marker ekle
  L.marker(currentPosition, { icon: personIcon }).addTo(map).bindPopup(msg);

  map.on("click", onMapClick);

  // Notları Render Eden Fonksiyon

  renderNotes();
  // Markerları render eden fonksiyon
  renderMarkers();
}

// ! Haritaya tıklanıldığında çalışacak fonksiyon
function onMapClick(e) {
  // Tıklanılan yerin kordinatlarına eriş
  clickedCoords = [e.latlng.lat, e.latlng.lng];

  // Aside a add clasını ekle

  elements.aside.classList.add("add");
}

// ! formun gönderildiğinde çalışacak fonksiyon

elements.form.addEventListener("submit", (e) => {
  // Sayfa yenilemeyi engelle
  e.preventDefault();

  // Form içerisindeki değerlere eriş
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  // Bir tane noto bjesi oluştur

  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: clickedCoords,
  };

  // Note dizisnie yeni not ekle
  notes.push(newNote);

  // Localstorage notları kaydet
  localStorage.setItem("notes", JSON.stringify(notes));

  // Formu Resetle
  e.target.reset();

  // aside eski haline çevir
  elements.aside.classList.remove("add");

  // Noteları render et
  renderNotes();
  // Markerları render et
  renderMarkers();
});

// ! Close btn e tıklanınca aside ı tekrardan eski haline çevir

elements.cancelBtn.addEventListener("click", () => {
  elements.aside.classList.remove("add");
});

// ! Mevcut Notları render eden fonksiyon

function renderNotes() {
  // note dizisinie dönerek herbir not için bir html oluştursun

  const noteCard = notes
    .map((note) => {
      // Tarih ayarı
      const date = new Date(note.date).toLocaleDateString("tr", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      // Status ayarlaması
      // getStatus adında bir fonksiyon yazıldı.
      // Bu fonksiyon kendisine verilen status değerine göre uygun ifadeyi return etti

      return `<li>
          <div>
            <p>${note.title}</p>
            <p>${date}</p>
            <p>${getStatus(note.status)}</p>
          </div>

          <div class="icons">
            <i data-id='${
              note.id
            }' class="bi bi-airplane-fill" id="fly-btn"></i>
            <i data-id='${note.id}' class="bi bi-trash" id="delete-btn"></i>
          </div>
        </li>`;
    })
    .join("");

  // ilgili htmli arayüze ekle
  elements.noteList.innerHTML = noteCard;

  document.querySelectorAll("#delete-btn").forEach((btn) => {
    // Dlete Ionun data idsine eriş
    const id = btn.dataset.id;

    // Delete iconlarına tıklanınca deletenote fonksyonu çalıştır

    btn.addEventListener("click", () => {
      deleteNote(id);
    });
  });
  // Fly Iconlara Eriş
  document.querySelectorAll("#fly-btn").forEach((btn) => {
    // Fly Btn'e tıklanınca flyNote fonksiyonunu çalıştır

    btn.addEventListener("click", () => {
      // Fly-btn'in id'sine eriş
      const id = +btn.dataset.id;
      flyToNote(id);
    });
  });
}

// ! Her not için bir marker render eden fnksiyon

function renderMarkers() {
  // Haritadaki markeları sıfırlar
  layer.clearLayers();
  notes.map((note) => {
    // Eklenicek iconun türüne karar ver
    const icon = getNoteIcon(note.status);

    // Not için bir marker oluştur
    L.marker(note.coords, { icon }).addTo(layer).bindPopup(note.title);
  });
}

// ! Delete Function

function deleteNote(id) {
  // Kullanıcıdan onay al
  const res = confirm("Not silme işlemini onaylıyor musunuz?");
  // Eğer kullanıcı onayladıysa
  if (res) {
    // İdsi bilinen notu note dizisinden kaldır
    notes = notes.filter((note) => note.id != id);
    // Localstorageı güncelle
    localStorage.setItem("notes", JSON.stringify(notes));

    // Notlerı render et
    renderNotes();
    // markerları render et
    renderMarkers();
  }
}

// ! Notlara focuslanan fonksiyon
function flyToNote(id) {
  // İd'si bilinen notu note dizisi içerisinden bul
  const foundedNote = notes.find((note) => note.id == id);

  // Bulunan not'a focuslan
  map.flyTo(foundedNote.coords, 12);
}

// arrowIcon'a tıklanınca çalışacak fonksiyon

elements.arrowIcon.addEventListener("click", () => {
  elements.aside.classList.toggle("hide");
});
