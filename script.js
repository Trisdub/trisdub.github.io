import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, where, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const tournamentContainer = document.getElementById("tournament-list");
const filterDate = document.getElementById("filter-date");
const filterProvince = document.getElementById("filter-province");

let tournaments = [];
let favorites = new Set();
let markers = [];

const mapContainer = document.getElementById('map-container');
const toggleBtn = document.getElementById('toggle-map');
let map;

toggleBtn.addEventListener('click', () => {
  mapContainer.classList.toggle('visible');
  toggleBtn.textContent = mapContainer.classList.contains('visible') ? "🗺️ Hide Map" : "🗺️ Show Map";
  map.invalidateSize();
});

// Initialize map
function initMap() {
  map = L.map('map').setView([46.8, -71.2], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
}

// Load tournaments and populate filters
async function loadTournaments() {
  const snap = await getDocs(query(collection(db, "tournaments"), orderBy("date")));
  tournaments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const provinces = [...new Set(tournaments.map(t=>t.province))];
  provinces.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    filterProvince.appendChild(opt);
  });
  render();
}

// Render tournaments
function render() {
  tournamentContainer.innerHTML = '';
  markers.forEach(m=>map.removeLayer(m));
  markers = [];

  const today = new Date();
  let filtered = tournaments.filter(t=>{
    if(new Date(t.date) < today) return false;
    if(filterDate.value && t.date !== filterDate.value) return false;
    if(filterProvince.value && t.province !== filterProvince.value) return false;
    return true;
  });

  filtered.forEach(t=>{
    const card = document.createElement("div");
    card.className = "tournament-card";
    card.innerHTML = `
      <div class="tournament-info">
        <h3>
          ${t.name} 
          <span class="favorite-heart ${favorites.has(t.id)?'favorited':''}" data-id="${t.id}">♥</span>
        </h3>
        <div class="details-row">
          <p><strong>Date:</strong> ${t.date}</p>
          <p><strong>City:</strong> ${t.city}</p>
          <p><strong>Level:</strong> ${t.level}</p>
          <p><strong>Address:</strong> ${t.address}</p>
          <p><strong>Registration:</strong> ${t.registration}</p>
        </div>
        <p class="org"><strong>Organizer:</strong> ${t.organizerName} - ${t.organizerPhone}</p>
      </div>
    `;
    tournamentContainer.appendChild(card);

    // Map marker
    if(t.lat && t.lng){
      const marker = L.marker([t.lat,t.lng]).addTo(map);
      marker.bindPopup(`<strong>${t.name}</strong><br>${t.address}<br>${t.date}<br>${t.level}`);
      markers.push(marker);
    }

    // Favorite toggle
    const heart = card.querySelector(".favorite-heart");
    heart.addEventListener("click", async ()=>{
      if(!auth.currentUser){ alert("Sign in to favorite."); return; }
      const favId = heart.dataset.id;
      if(favorites.has(favId)){
        favorites.delete(favId);
        heart.classList.remove("favorited");
        // Remove from Firebase
        const favQuery = query(collection(db,"favorites"), where("userId","==",auth.currentUser.uid), where("tournamentId","==",favId));
        const favSnap = await getDocs(favQuery);
        favSnap.forEach(async docSnap=>await deleteDoc(doc(db,"favorites",docSnap.id)));
      } else {
        favorites.add(favId);
        heart.classList.add("favorited");
        // Add to Firebase
        await addDoc(collection(db,"favorites"), { userId: auth.currentUser.uid, tournamentId: favId, createdAt: new Date() });
      }
    });
  });
}

filterDate.addEventListener("change", render);
filterProvince.addEventListener("change", render);

onAuthStateChanged(auth,user=>{
  if(!user) return;
  // Load user's favorites
  getDocs(query(collection(db,"favorites"),where("userId","==",user.uid)))
    .then(snap=>{
      snap.forEach(d=>favorites.add(d.data().tournamentId));
      render();
    });
});

initMap();
loadTournaments();
