// ===============================
// Firebase Configuration
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyCfVProG4-iZ8z4r869oiBHB7OX4Fl3lMU",
  authDomain: "volleyball-tourneys.firebaseapp.com",
  projectId: "volleyball-tourneys",
  storageBucket: "volleyball-tourneys.firebasestorage.app",
  messagingSenderId: "901949085281",
  appId: "1:901949085281:web:7237e4d5e812a9f1d0f234"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===============================
// Event Display on Homepage
// ===============================
const eventsList = document.getElementById("eventsList");

async function loadEvents() {
  const snapshot = await db.collection("events").orderBy("createdAt", "desc").get();
  eventsList.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    const eventItem = document.createElement("div");
    eventItem.classList.add("event-item");
    eventItem.innerHTML = `
      <h3>${data.name}</h3>
      <p><strong>Type:</strong> ${data.type}</p>
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Location:</strong> ${data.address}</p>
    `;
    eventsList.appendChild(eventItem);

    // Add marker to map
    if (data.latitude && data.longitude) {
      addMarkerToMap(data);
    }
  });
}

// ===============================
// Map Initialization (Leaflet)
// ===============================
let map = L.map('map', {
  center: [45.5017, -73.5673], // Default center (Montreal)
  zoom: 10,
  scrollWheelZoom: false
});

// OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Marker colors by event type
const eventTypeColors = {
  "Open Gym": "blue",
  "Competitive": "red",
  "Recreational": "green"
};

// Function to add markers
function addMarkerToMap(eventData) {
  const color = eventTypeColors[eventData.type] || "gray";

  const customIcon = L.divIcon({
    className: "custom-pin",
    html: `<div style="background-color:${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  const marker = L.marker([eventData.latitude, eventData.longitude], { icon: customIcon }).addTo(map);
  marker.bindPopup(`
    <b>${eventData.name}</b><br>
    ${eventData.type}<br>
    ${eventData.address}<br>
    ${eventData.date}
  `);
}

// ===============================
// Geocoding (Convert address → coordinates)
// ===============================
async function getCoordinatesFromAddress(address) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching coordinates:", err);
    return null;
  }
}

// ===============================
// Collapsible Map Control
// ===============================
const mapContainer = document.getElementById("mapContainer");
const mapToggle = document.getElementById("mapToggle");

mapToggle.addEventListener("click", () => {
  mapContainer.classList.toggle("collapsed");
  setTimeout(() => map.invalidateSize(), 400);
});

// ===============================
// Load events on startup
// ===============================
if (eventsList) {
  loadEvents();
}
