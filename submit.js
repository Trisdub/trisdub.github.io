const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("auth-status").style.display = "none";
    document.getElementById("event-form").style.display = "block";
  } else {
    document.getElementById("auth-status").style.display = "block";
    document.getElementById("event-form").style.display = "none";
  }
});
