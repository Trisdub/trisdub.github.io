// auth.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// UI elements
const toggleCreate = document.getElementById("toggle-create");
const createForm = document.getElementById("create-form");
const toggleLogin = document.getElementById("toggle-login");
const loginForm = document.getElementById("login-form");
const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const forgotBtn = document.getElementById("forgot-btn");
const authMessage = document.getElementById("auth-message");

toggleCreate.addEventListener("click", () => {
  createForm.style.display = (createForm.style.display === "none") ? "block" : "none";
  loginForm.style.display = "none";
  authMessage.textContent = "";
});

toggleLogin.addEventListener("click", () => {
  loginForm.style.display = (loginForm.style.display === "none") ? "block" : "none";
  createForm.style.display = "none";
  authMessage.textContent = "";
});

signupBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    authMessage.style.color = "green";
    authMessage.textContent = "Account created — redirecting...";
    setTimeout(() => window.location.href = "submit.html", 900);
  } catch (err) {
    authMessage.style.color = "red";
    authMessage.textContent = err.message;
  }
});

loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    authMessage.style.color = "green";
    authMessage.textContent = "Logged in — redirecting...";
    setTimeout(() => window.location.href = "index.html", 700);
  } catch (err) {
    authMessage.style.color = "red";
    authMessage.textContent = err.message;
  }
});

// Forgot password: uses login email field value
forgotBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  if (!email) {
    authMessage.style.color = "red";
    authMessage.textContent = "Enter your email in the Log In form above to receive a reset link.";
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    authMessage.style.color = "green";
    authMessage.textContent = "Password reset email sent — check your inbox.";
  } catch (err) {
    authMessage.style.color = "red";
    authMessage.textContent = err.message;
  }
});
