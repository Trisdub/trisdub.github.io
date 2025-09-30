// Initialize Firebase Auth
const auth = firebase.auth();

// Sign Up
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    alert("Account created! You are now logged in.");
    window.location.href = "submit.html";
  } catch (error) {
    alert(error.message);
  }
});

// Log In
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert("Logged in successfully!");
    window.location.href = "submit.html";
  } catch (error) {
    alert(error.message);
  }
});

// Log Out
document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    await auth.signOut();
    alert("Logged out!");
    location.reload();
  } catch (error) {
    alert(error.message);
  }
});
