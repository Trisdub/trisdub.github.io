// Initialize Firebase Auth
const auth = firebase.auth();

// Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const authMessage = document.getElementById("auth-message");

// Login
loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      authMessage.textContent = "Login successful! Redirecting...";
      setTimeout(() => {
        window.location.href = "submit.html";
      }, 1000);
    })
    .catch(error => {
      authMessage.textContent = "Error: " + error.message;
    });
});

// Create Account
signupBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      authMessage.textContent = "Account created! Redirecting...";
      setTimeout(() => {
        window.location.href = "submit.html";
      }, 1000);
    })
    .catch(error => {
      authMessage.textContent = "Error: " + error.message;
    });
});
