import { auth, db } from './config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const userEmail = document.getElementById('userEmail');
const userEventsTable = document.getElementById('userEventsTable');
const deleteAllBtn = document.getElementById('deleteAllBtn');

onAuthStateChanged(auth, async (user) => {
  if (user) {
    userEmail.textContent = `Signed in as: ${user.email}`;
    loadUserEvents(user.uid);
  } else {
    window.location.href = "auth.html"; // redirect if not logged in
  }
});

async function loadUserEvents(uid) {
  userEventsTable.innerHTML = "";

  const q = query(collection(db, "tournaments"), where("createdBy", "==", uid));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    userEventsTable.innerHTML = `<tr><td colspan="5">No events found.</td></tr>`;
    deleteAllBtn.style.display = "none";
    return;
  }

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.name}</td>
      <td>${data.date}</td>
      <td>${data.location}</td>
      <td>${data.province}</td>
      <td><button class="deleteBtn" data-id="${docSnap.id}">Delete</button></td>
    `;

    userEventsTable.appendChild(row);
  });

  deleteAllBtn.style.display = "inline-block";

  // Attach delete handlers
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      await deleteDoc(doc(db, "tournaments", id));
      loadUserEvents(auth.currentUser.uid);
    });
  });
}

// Delete all events
deleteAllBtn.addEventListener("click", async () => {
  if (confirm("Are you sure you want to delete ALL your events?")) {
    const q = query(collection(db, "tournaments"), where("createdBy", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(doc(db, "tournaments", docSnap.id));
    }

    loadUserEvents(auth.currentUser.uid);
  }
});
