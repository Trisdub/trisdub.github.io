// Initialize Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements
const authStatus = document.getElementById("auth-status");
const eventForm = document.getElementById("event-form");
const successCheck = document.querySelector(".checkmark");

// Check if user is logged in
auth.onAuthStateChanged(user => {
  if (user) {
    // Show form
    authStatus.style.display = "none";
    eventForm.style.display = "block";
  } else {
    // Show login message
    authStatus.style.display = "block";
    eventForm.style.display = "none";
  }
});

// Form submission
eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const eventName = document.getElementById("event-name").value;
  const eventDate = document.getElementById("event-date").value;
  const eventLocation = document.getElementById("event-location").value;
  const eventCategory = document.getElementById("event-category").value;
  const organizerPhone = document.getElementById("organizer-phone").value;

  // Validate phone number
  const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
  if (!phonePattern.test(organizerPhone)) {
    alert("Invalid phone number. Please use the format: 123-456-7890");
    return;
  }

  try {
    await db.collection("events").add({
      name: eventName,
      date: eventDate,
      location: eventLocation,
      category: eventCategory,
      phone: organizerPhone,
      createdBy: auth.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    successCheck.classList.add("visible");
    setTimeout(() => {
      successCheck.classList.remove("visible");
      eventForm.reset();
    }, 2000);

  } catch (error) {
    console.error("Error adding event: ", error);
    alert("Error: " + error.message);
  }
});
