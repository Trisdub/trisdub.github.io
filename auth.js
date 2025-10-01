import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfVProG4-iZ8z4r869oiBHB7OX4Fl3lMU",
  authDomain: "volleyball-tourneys.firebaseapp.com",
  projectId: "volleyball-tourneys",
  storageBucket: "volleyball-tourneys.firebasestorage.app",
  messagingSenderId: "652764056781",
  appId: "1:652764056781:web:70f90b5a6f5357aff16d84",
  measurementId: "G-HJF63771D7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Toggle forms
document.getElementById("toggle-create").addEventListener("click", () => {
  document.getElementById("create-form").style.display = "block";
  document.getElementById("login-form").style.display = "none";
});

document.getElementById("toggle-login").addEventListener("click", () => {
  document.getElementById("login-form").style.display = "block";
  document.getElementById("create-form").style.display = "none";
});

// Create account
document.getElementById("create-btn").addEventListener("click", async () => {
  const email = document.getElementById("create-email").value;
  const password = document.getElementById("create-password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    document.getElementById("auth-message").innerText = "Account created! You can now log in.";
  } catch (error) {
    document.getElementById("auth-message").innerText = "Error: " + error.message;
  }
});

// Login
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (error) {
    document.getElementById("auth-message").innerText = "Error: " + error.message;
  }
});

// Forgot password
document.getElementById("forgot-password-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  if (!email) {
    document.getElementById("auth-message").innerText = "Enter your email above first.";
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    document.getElementById("auth-message").innerText = "Password reset email sent!";
  } catch (error) {
    document.getElementById("auth-message").innerText = "Error: " + error.message;
  }
});
