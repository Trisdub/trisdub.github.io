import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfVProG4-iZ8z4r869oiBHB7OX4Fl3lMU",
  authDomain: "volleyball-tourneys.firebaseapp.com",
  projectId: "volleyball-tourneys",
  storageBucket: "volleyball-tourneys.appspot.com",
  messagingSenderId: "640577250571",
  appId: "1:640577250571:web:0cd0feca9326a5e36d1e92"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const toggleCreate = document.getElementById("toggle-create");
const createForm = document.getElementById("create-form");

const toggleLogin = document.getElementById("toggle-login");
const loginForm = document.getElementById("login-form");

const createBtn = document.getElementById("create-btn");
const loginBtn = document.getElementById("login-btn");
const authMessage = document.getElementById("auth-message");

// Toggle Create Account Form
toggleCreate.addEventListener("click", () => {
  createForm.style.display = createForm.style.display === "none" ? "block" : "none";
  loginForm.style.display = "none"; // hide login if open
});

// Toggle Login Form
toggleLogin.addEventListener("click", () => {
  loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
  createForm.style.display = "none"; // hide signup if open
});

// Create Account
createBtn.addEventListener("click", async () => {
  const email = document.getElementById("create-email").value;
  const password = document.getElementById("create-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    authMessage.textContent = "Account created successfully! Redirecting...";
    authMessage.style.color = "green";
    setTimeout(() => (window.location.href = "index.html"), 1500);
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.style.color = "red";
  }
});

// Login
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    authMessage.textContent = "Logged in successfully! Redirecting...";
    authMessage.style.color = "green";
    setTimeout(() => (window.location.href = "index.html"), 1500);
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.style.color = "red";
  }
});
