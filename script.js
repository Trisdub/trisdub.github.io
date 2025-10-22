// =========================
// Tournament Data
// =========================
let tournaments = [
    { name: "Summer Slam", location: "Montreal, QC", date: "2025-06-15", description: "A fun summer tournament for all levels.", lat: 45.5017, lng: -73.5673 },
    { name: "Winter Spike", location: "Toronto, ON", date: "2025-12-05", description: "Indoor winter tournament.", lat: 43.6532, lng: -79.3832 }
];

// =========================
// Render Tournament Cards
// =========================
function renderTournaments() {
    const container = document.querySelector(".tournament-list");
    container.innerHTML = "";

    tournaments.forEach(t => {
        const card = document.createElement("div");
        card.className = "tournament-card";
        card.innerHTML = `
            <h3>${t.name}</h3>
            <p><strong>Location:</strong> ${t.location}</p>
            <p><strong>Date:</strong> ${t.date}</p>
            <p>${t.description}</p>
        `;
        container.appendChild(card);
    });
}

// =========================
// Initialize Map
// =========================
const map = L.map('map').setView([45.5017, -73.5673], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markers = [];

function renderMapMarkers() {
    // Remove existing markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    tournaments.forEach(t => {
        if(t.lat && t.lng){
            const marker = L.marker([t.lat, t.lng])
                .addTo(map)
                .bindPopup(`<strong>${t.name}</strong><br>${t.location}<br>${t.date}`);
            markers.push(marker);
        }
    });
}

// =========================
// Geocode using Nominatim
// =========================
async function geocodeLocation(location) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const data = await response.json();
    if(data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } else {
        alert("Location not found. Using default coordinates.");
        return { lat: 45.4215, lng: -75.6972 }; // default Ottawa
    }
}

// =========================
// Form Submission
// =========================
document.getElementById("tournamentForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const location = document.getElementById("location").value;
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value;

    const coords = await geocodeLocation(location);

    const newTournament = { name, location, date, description, lat: coords.lat, lng: coords.lng };
    tournaments.push(newTournament);

    renderTournaments();
    renderMapMarkers();

    this.reset();
});

// =========================
// Initial Render
// =========================
renderTournaments();
renderMapMarkers();
