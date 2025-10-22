// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCfVProG4-iZ8z4r869oiBHB7OX4Fl3lMU",
  authDomain: "volleyball-tourneys.firebaseapp.com",
  projectId: "volleyball-tourneys",
  storageBucket: "volleyball-tourneys.firebasestorage.app",
  messagingSenderId: "970156221054",
  appId: "1:970156221054:web:a4b8cfe7b71f3f99809d8f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// UI elements
const eventList = document.getElementById("eventList");
const provinceFilter = document.getElementById("provinceFilter");
const dateFilter = document.getElementById("dateFilter");
const levelFilter = document.getElementById("levelFilter");
const mapToggleBtn = document.getElementById("mapToggleBtn");
const mapContainer = document.getElementById("map");

// Map setup (OpenStreetMap + Leaflet)
let map, markers = [];
function initMap() {
  map = L.map('map').setView([56, -96], 4); // Centered on Canada

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}
initMap();

// Toggle map visibility
if (mapToggleBtn) {
  mapToggleBtn.addEventListener('click', () => {
    mapContainer.classList.toggle('hidden');
    setTimeout(() => map.invalidateSize(), 300);
  });
}

// Load events
async function loadEvents() {
  eventList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "events"));
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    displayEvent(docSnap.id, data);
  });
}

// Display single event
function displayEvent(id, data) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data.name}</td>
    <td>${data.date}</td>
    <td>${data.province}</td>
    <td>${data.level}</td>
    <td><i class="heart-icon ${data.isFavorite ? 'fas' : 'far'} fa-heart" data-id="${id}" style="color:red; cursor:pointer;"></i></td>
  `;
  eventList.appendChild(row);

  // Add marker on map
  addMarker(data);
}

// Add map markers with color by event type
function addMarker(event) {
  if (!event.latitude || !event.longitude) return;

  let color;
  if (event.level === "Open Gym") color = "blue";
  else if (event.level === "Competitive") color = "red";
  else color = "green";

  const markerIcon = L.divIcon({
    className: "custom-marker",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
             <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
           </svg>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const marker = L.marker([event.latitude, event.longitude], { icon: markerIcon }).addTo(map);
  marker.bindPopup(`<b>${event.name}</b><br>${event.date}<br>${event.province}`);
  markers.push(marker);
}

// Favorite handler
eventList.addEventListener("click", async (e) => {
  if (e.target.classList.contains("fa-heart")) {
    const heart = e.target;
    const eventId = heart.dataset.id;
    const eventRef = doc(db, "events", eventId);
    const isFavorite = heart.classList.contains("far");

    await updateDoc(eventRef, { isFavorite: isFavorite });
    heart.classList.toggle("far");
    heart.classList.toggle("fas");
  }
});

// Auth
onAuthStateChanged(auth, (user) => {
  if (user) loadEvents();
  else window.location.href = "login.html";
});

document.getElementById("signOutBtn")?.addEventListener("click", () => signOut(auth));
