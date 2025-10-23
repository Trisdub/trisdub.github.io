import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot, getDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createdEl = document.getElementById("created-tournaments");
const favEl = document.getElementById("favorites-list");
const logoutBtn = document.getElementById("logout-btn");

function renderTournaments(container, list, showHeart=true){
  container.innerHTML = '';
  if(!list.length) container.innerHTML = "<p>No tournaments.</p>";
  list.forEach(t=>{
    const card = document.createElement("div");
    card.className = "tournament-card";
    card.innerHTML = `
      <div class="tournament-info">
        <h3>
          ${t.name} 
          ${showHeart? `<span class="favorite-heart ${t.favorited?'favorited':''}" data-id="${t.id}">♥</span>` : ''}
        </h3>
        <div class="details-row">
          <p><strong>Date:</strong> ${t.date}</p>
          <p><strong>City:</strong> ${t.city}</p>
          <p><strong>Level:</strong> ${t.level}</p>
          <p><strong>Address:</strong> ${t.address}</p>
          <p><strong>Registration:</strong> ${t.registration}</p>
        </div>
        <p class="org"><strong>Organizer:</strong> ${t.organizerName} - ${t.organizerPhone}</p>
        ${t.canDelete? `<button class="delete-btn" data-id="${t.id}">Delete Tournament</button>` : ''}
      </div>
    `;
    container.appendChild(card);

    if(t.canDelete){
      const btn = card.querySelector(".delete-btn");
      btn.addEventListener("click", async ()=>{
        if(!confirm("Delete this tournament?")) return;
        await deleteDoc(doc(db,"tournaments",t.id));
      });
    }

    if(showHeart){
      const heart = card.querySelector(".favorite-heart");
      heart.addEventListener("click", async ()=>{
        const favQuery = query(collection(db,"favorites"), where("userId","==",auth.currentUser.uid), where("tournamentId","==",t.id));
        const snap = await getDocs(favQuery);
        if(heart.classList.contains("favorited")){
          heart.classList.remove("favorited");
          snap.forEach(d=>deleteDoc(doc(db,"favorites",d.id)));
        } else {
          heart.classList.add("favorited");
          await addDoc(collection(db,"favorites"), { userId: auth.currentUser.uid, tournamentId: t.id, createdAt:new Date() });
        }
      });
    }
  });
}

onAuthStateChanged(auth,user=>{
  if(!user) return;
  logoutBtn.style.display="inline-block";
  logoutBtn.onclick = ()=>signOut(auth);

  // Created tournaments
  const createdQ = query(collection(db,"tournaments"), where("createdBy","==",user.uid), orderBy("date","asc"));
  onSnapshot(createdQ,snap=>{
    const list = snap.docs.map(d=>({...d.data(), id:d.id, canDelete:true}));
    renderTournaments(createdEl,list,false);
  });

  // Favorites
  const favQ = query(collection(db,"
