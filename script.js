import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Map initialization
const map = L.map('map').setView([45.5017, -73.5673], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markers = [];

function renderMapMarkers(tournaments) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    tournaments.forEach(t => {
        if (t.lat && t.lng) {
            const marker = L.marker([t.lat, t.lng])
                .addTo(map)
                .bindPopup(`<strong>${t.name}</strong><br>${t.city}, ${t.province}<br>${t.date}`);
            markers.push(marker);
        }
    });
}

function renderTournamentList(tournaments) {
    const ul = document.getElementById("tournaments");
    ul.innerHTML = "";
    tournaments.forEach(t => {
        const li = document.createElement("li");
        li.textContent = `${t.name} — ${t.city}, ${t.province} — ${t.date}`;
        ul.appendChild(li);
    });
}

// Load tournaments from Firebase
const tournamentsCol = collection(db, "tournaments");
onSnapshot(tournamentsCol, snapshot => {
    const tournaments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTournamentList(tournaments);
    renderMapMarkers(tournaments);
});
