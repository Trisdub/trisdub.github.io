// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCfVProG4-iZ8z4r869oiBHB7OX4Fl3lMU",
  authDomain: "volleyball-tourneys.firebaseapp.com",
  projectId: "volleyball-tourneys",
  storageBucket: "volleyball-tourneys.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

let map;
let markers = [];
let tournaments = [];

// Initialize map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 45.5017, lng: -73.5673 }, // default to Montreal
    zoom: 5
  });
  loadTournaments();
}

// Load tournaments from Firestore
function loadTournaments() {
  db.collection('tournaments').get().then((querySnapshot) => {
    tournaments = [];
    clearMarkers();
    querySnapshot.forEach((doc) => {
      const tournament = doc.data();
      tournament.id = doc.id;
      tournaments.push(tournament);
      addMarker(tournament);
    });
    displayTournamentList(tournaments);
  });
}

// Display tournaments in the list
function displayTournamentList(list) {
  const container = document.getElementById('tournament-list');
  container.innerHTML = '';
  list.forEach(t => {
    const div = document.createElement('div');
    div.className = 'tournament-item';
    div.innerHTML = `<h3>${t.name}</h3>
                     <p>${t.city}, ${t.date}</p>
                     <button class='fav-btn' data-id='${t.id}'>${t.isFavorite ? 'Unfavorite' : 'Favorite'}</button>`;
    container.appendChild(div);
  });
  addFavoriteListeners();
}

// Add markers to the map
function addMarker(tournament) {
  const marker = new google.maps.Marker({
    position: { lat: tournament.lat, lng: tournament.lng },
    map: map,
    title: tournament.name
  });
  const infowindow = new google.maps.InfoWindow({
    content: `<h3>${tournament.name}</h3><p>${tournament.city}, ${tournament.date}</p>`
  });
  marker.addListener('click', () => {
    infowindow.open(map, marker);
  });
  markers.push(marker);
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

// Favorite/unfavorite buttons
function addFavoriteListeners() {
  const buttons = document.querySelectorAll('.fav-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      toggleFavorite(id, btn);
    });
  });
}

function toggleFavorite(tournamentId, btn) {
  const user = auth.currentUser;
  if (!user) {
    alert('Please log in to favorite tournaments.');
    return;
  }
  const favRef = db.collection('users').doc(user.uid);
  favRef.get().then(doc => {
    let favorites = doc.exists && doc.data().favorites ? doc.data().favorites : [];
    if (favorites.includes(tournamentId)) {
      favorites = favorites.filter(f => f !== tournamentId);
      btn.innerText = 'Favorite';
    } else {
      favorites.push(tournamentId);
      btn.innerText = 'Unfavorite';
    }
    favRef.set({ favorites }, { merge: true });
  });
}

// Authentication
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('user-email').innerText = user.email;
  } else {
    document.getElementById('user-email').innerText = 'Not logged in';
  }
});

function login(email, password) {
  auth.signInWithEmailAndPassword(email, password).catch(err => alert(err.message));
}

function logout() {
  auth.signOut();
}

function register(email, password) {
  auth.createUserWithEmailAndPassword(email, password).catch(err => alert(err.message));
}

// Search/filter functionality
function searchTournaments(keyword) {
  const filtered = tournaments.filter(t => t.name.toLowerCase().includes(keyword.toLowerCase()));
  displayTournamentList(filtered);
}

document.getElementById('search-input').addEventListener('input', e => {
  searchTournaments(e.target.value);
});

// Initialize map when page loads
window.onload = initMap;
