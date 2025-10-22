import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const form = document.getElementById("tournament-form");
const authStatusEl = document.getElementById("auth-status");
const successCheck = document.getElementById("success-check");
let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user;
  if(user){
    authStatusEl.innerHTML = `<p>Signed in as ${user.email}</p><button id="signout-btn" class="submit-btn">Sign Out</button>`;
    document.getElementById("signout-btn").addEventListener("click", async () => { await signOut(auth); });
  } else {
    authStatusEl.innerHTML = `<a href="auth.html" class="submit-btn">Sign In / Create Account</a>`;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if(!currentUser){ alert("You must sign in before submitting a tournament."); return; }

  const organizerPhone = document.getElementById("organizerPhone").value.trim();
  const phoneRegex = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
  if(!phoneRegex.test(organizerPhone)){ alert("Invalid phone number"); return; }

  const payload = {
    name: document.getElementById("name").value.trim(),
    province: document.getElementById("province").value,
    city: document.getElementById("city").value.trim(),
    date: document.getElementById("date").value,
    address: document.getElementById("address").value.trim(),
    level: document.querySelector("input[name='level']:checked")?.value || "",
    registration: document.getElementById("registration").value.trim(),
    organizerName: document.getElementById("organizerName").value.trim() || null,
    organizerPhone,
    createdBy: currentUser.uid,
    createdAt: serverTimestamp()
  };

  try{
    await addDoc(collection(db, "tournaments"), payload);
    form.reset();
    successCheck.style.display = "inline";
    setTimeout(() => successCheck.style.display = "none", 2000);
  } catch(err){
    alert("Error submitting tournament: " + err.message);
  }
});
