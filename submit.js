// submit.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

const authStatusEl = document.getElementById("auth-status");
const form = document.getElementById("tournament-form");
const successCheck = document.getElementById("success-check");

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    authStatusEl.innerHTML = `
      <p>Signed in as ${user.email}</p>
      <button id="signout-btn" class="submit-btn">Sign Out</button>
    `;
    document.getElementById("signout-btn").addEventListener("click", async () => { await signOut(auth); });
  } else {
    authStatusEl.innerHTML = `<a href="auth.html" class="submit-btn">Sign In / Create Account</a>`;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) {
    alert("You must sign in before submitting an event.");
    return;
  }

  const organizerPhone = document.getElementById("organizerPhone").value.trim();
  const phoneRegex = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
  if (!phoneRegex.test(organizerPhone)) {
    alert("Invalid phone number");
    return;
  }

  const payload = {
    name: document.getElementById("name").value.trim(),
    province: document.getElementById("province").value,
    region: document.getElementById("region").value.trim(),
    city: document.getElementById("city").value.trim(),
    date: document.getElementById("date").value, // YYYY-MM-DD
    address: document.getElementById("address").value.trim(),
    registration: document.getElementById("registration").value.trim(),
    level: document.querySelector("input[name='level']:checked")?.value || "",
    organizerName: document.getElementById("organizerName").value.trim() || null,
    organizerPhone: organizerPhone,
    createdBy: currentUser.uid,
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "tournaments"), payload);
    // show green check briefly
    successCheck.classList.add("visible");
    setTimeout(()=> successCheck.classList.remove("visible"), 1800);
    form.reset();
  } catch (err) {
    alert("Error: " + err.message);
  }
});
