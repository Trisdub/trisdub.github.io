import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Example tournaments (can be fetched from Firebase too)
let tournaments = [
  { name: "Summer Slam", location: "Montreal, QC", date: "2025-06-15", description: "A fun summer tournament for all levels.", lat: 45.5017, lng: -73.5673 },
  { name: "Winter Spike", location: "Toronto, ON", date: "2025-12-05", description: "Indoor winter tournament.", lat: 43.6532, lng: -79.3832 }
];

const tournamentContainer = document.querySelector(".tournament-list");

// Render tournament cards
function renderTournaments() {
  tournamentContainer.innerHTML = "";
  tournaments.forEach(t => {
    const card = document.createElement("div");
    card.className = "tournament-card";
    card.innerHTML = `
      <h3>${t.name}</h3>
      <p><strong>Location:</strong> ${t.location}</p>
      <p><strong>Date:</strong> ${t.date}</p>
      <p>${t.description}</p>
    `;
    tournamentContainer.appendChild(card);
  });
}

// Initialize map
const map = L.map('map').setView([45.5, -73.6], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markers = [];
function renderMapMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  tournaments.forEach(t => {
    if (t.lat && t.lng) {
      const marker = L.marker([t.lat, t.lng])
        .addTo(map)
        .bindPopup(`<strong>${t.name}</strong><br>${t.location}<br>${t.date}`);
      markers.push(marker);
    }
  });
}

// Fetch tournaments from Firebase (optional)
async function loadTournaments() {
  const snap = await getDocs(collection(db, "tournaments"));
  tournaments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderTournaments();
  renderMapMarkers();
}

// Initial render
renderTournaments();
renderMapMarkers();
loadTournaments();
