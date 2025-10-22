import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, collection, query, orderBy, onSnapshot,
  deleteDoc, doc, setDoc, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const submitLink = document.getElementById("submit-link");
const accountLink = document.getElementById("account-link");
const logoutBtn = document.getElementById("logout-btn");
const authLink = document.getElementById("auth-link");
const provinceFilter = document.getElementById("province-filter");
const levelFilter = document.getElementById("level-filter");
const dateFromEl = document.getElementById("date-from");
const dateToEl = document.getElementById("date-to");
const tableBody = document.getElementById("tournament-table-body");

let currentUser = null;
let allTournaments = [];
let favoriteIds = new Set();
let favoritesUnsub = null;
let map, markers = [];

function todayISO() {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d.toISOString().slice(0,10);
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    submitLink.style.display = "inline-block";
    accountLink.style.display = "inline-block";
    logoutBtn.style.display = "inline-block";
    authLink.style.display = "none";
    startFavoritesListener(user.uid);
  } else {
    submitLink.style.display = "none";
    accountLink.style.display = "none";
    logoutBtn.style.display = "none";
    authLink.style.display = "inline-block";
    stopFavoritesListener();
    favoriteIds.clear();
  }
  renderList();
});

logoutBtn.addEventListener("click", async () => await signOut(auth));

const q = query(collection(db, "tournaments"), orderBy("date", "asc"));
onSnapshot(q, (snapshot) => {
  allTournaments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  renderList();
  updateMapPins();
});

function startFavoritesListener(uid) {
  stopFavoritesListener();
  const favQuery = query(collection(db, "favorites"), where("userId", "==", uid));
  favoritesUnsub = onSnapshot(favQuery, (snap) => {
    favoriteIds.clear();
    snap.forEach(d => favoriteIds.add(d.data().tournamentId));
    renderList();
  });
}
function stopFavoritesListener() {
  if (typeof favoritesUnsub === "function") favoritesUnsub();
  favoritesUnsub = null;
}

async function toggleFavorite(id, isFav) {
  if (!currentUser) return alert("Sign in to favorite tournaments.");
  const ref = doc(db, "favorites", `${currentUser.uid}_${id}`);
  try {
    if (!isFav)
      await setDoc(ref, { userId: currentUser.uid, tournamentId: id, createdAt: serverTimestamp() });
    else
      await deleteDoc(ref);
  } catch (err) {
    alert("Favorite action failed: " + err.message);
  }
}

function escapeHtml(s) {
  return String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
function formatRegistration(val) {
  if (!val) return "";
  if (val.startsWith("http")) return `<a href="${val}" target="_blank">${val}</a>`;
  return val;
}

function renderList() {
  const today = todayISO();
  let visible = allTournaments.filter(t => t.date >= today);
  const prov = provinceFilter.value.trim();
  const level = levelFilter.value.trim();
  const from = dateFromEl.value;
  const to = dateToEl.value;
  if (prov) visible = visible.filter(t => t.province === prov);
  if (level) visible = visible.filter(t => t.level === level);
  if (from) visible = visible.filter(t => t.date >= from);
  if (to) visible = visible.filter(t => t.date <= to);

  tableBody.innerHTML = "";
  if (!visible.length) {
    tableBody.innerHTML = "<tr><td colspan='9' class='empty-message'>No upcoming tournaments</td></tr>";
    return;
  }

  visible.forEach(t => {
    const isFav = favoriteIds.has(t.id);
    const tr = document.createElement("tr");
    const deleteHtml = (currentUser && t.createdBy === currentUser.uid)
      ? `<button class="delete-btn" data-id="${t.id}">Delete</button>` : "";
    const favHtml = `<button class="fav-btn ${isFav ? 'active' : ''}" data-id="${t.id}">
      ${isFav ? '♥' : '♡'}
    </button>`;
    tr.innerHTML = `
      <td>${escapeHtml(t.name||"")}</td>
      <td>${escapeHtml(t.province||"")}</td>
      <td>${escapeHtml(t.region||"")}</td>
      <td>${escapeHtml(t.city||"")}</td>
      <td>${escapeHtml(t.date||"")}</td>
      <td>${escapeHtml(t.level||"")}</td>
      <td>${formatRegistration(t.registration)}</td>
      <td>${escapeHtml(t.address||"")}</td>
      <td class="actions-cell">${deleteHtml} ${favHtml}</td>
    `;
    tableBody.appendChild(tr);
  });

  document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", async e => {
    if (!confirm("Delete this tournament?")) return;
    await deleteDoc(doc(db, "tournaments", e.target.dataset.id));
  }));
  document.querySelectorAll(".fav-btn").forEach(btn => btn.addEventListener("click", async e => {
    const id = e.target.dataset.id;
    const fav = favoriteIds.has(id);
    await toggleFavorite(id, fav);
  }));
}

/* Map setup */
function initMap() {
  map = L.map('map').setView([56.1304, -106.3468], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }).addTo(map);
}
function updateMapPins() {
  if (!map) return;
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  allTournaments.forEach(t => {
    if (!t.lat || !t.lng) return;
    let color = t.level === "Open Gym" ? "green" : t.level === "Competitive" ? "blue" : "orange";
    const icon = L.divIcon({ className: 'custom-pin', html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${color}" viewBox="0 0 24 24"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z"/></svg>` });
    const m = L.marker([t.lat, t.lng], { icon }).addTo(map)
      .bindPopup(`<strong>${escapeHtml(t.name)}</strong><br>${escapeHtml(t.city||"")}`);
    markers.push(m);
  });
}

/* Toggle map visibility */
const mapContainer = document.getElementById("map-container");
const toggleBtn = document.getElementById("toggle-map");
toggleBtn.addEventListener("click", () => {
  mapContainer.classList.toggle("collapsed");
  toggleBtn.textContent = mapContainer.classList.contains("collapsed") ? "🗺 Show Map" : "Hide Map";
  if (!map) initMap();
  setTimeout(() => map.invalidateSize(), 300);
});

/* Filters */
provinceFilter.addEventListener("change", renderList);
levelFilter.addEventListener("change", renderList);
dateFromEl.addEventListener("change", renderList);
dateToEl.addEventListener("change", renderList);
