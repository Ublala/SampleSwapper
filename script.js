// 🔹 Firebase Configuratie (vervang met jouw Firebase-config)
const firebaseConfig = {
    apiKey: "AIzaSyAhKPrwi66YsMtxnpeINOfVT0LC67KG5tw",
    authDomain: "sampleswapper.firebaseapp.com",
    projectId: "sampleswapper",
    storageBucket: "sampleswapper.appspot.com",
    messagingSenderId: "30622034305",
    appId: "1:30622034305:web:c11d34889c902304e3e080"
};

// 🔹 Firebase Initialiseren
firebase.initializeApp(firebaseConfig);

// 🔹 Firebase Services Globaal Beschikbaar Maken
window.auth = firebase.auth();
window.db = firebase.firestore();

// 🔹 Controleer of Firebase correct is geladen
console.log("✅ Firebase is geladen:", firebase);
console.log("✅ Firestore Database:", db);

// 🔹 Automatisch tekstvakhoogte aanpassen
window.autoResize = function (element) {
    element.style.height = "auto";
    element.style.height = (element.scrollHeight) + "px";
};

// 🔹 Controleer automatisch bij opstarten of gebruiker ingelogd is
window.onload = () => {
    auth.onAuthStateChanged(user => {
        loadSamples(user);
    });
};

// 🔹 Gebruiker Inloggen (FIXED)
window.login = function () {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("✅ Inloggen succesvol!");
            loadSamples(auth.currentUser);
        })
        .catch(error => {
            console.error("❌ Fout bij inloggen:", error);
            alert("❌ Fout: " + error.message);
        });
};

// 🔹 Samples Ophalen uit Database en Weergeven (FIXED)
window.loadSamples = function (user) {
    document.getElementById("sampleList").innerHTML = "";

    window.db.collection("samples").orderBy("timestamp", "desc").get().then(snapshot => {
        snapshot.forEach(doc => {
            let sample = doc.data();
            let isOwner = user && sample.userId === user.uid;

            let sampleHTML = `<div id="sample-${doc.id}" class="sample-card">`;
            sampleHTML += `<h3 class="sample-name">${sample.name}</h3>`;
            sampleHTML += sample.age ? `<p><strong>Leeftijd:</strong> <span class="sample-age">${sample.age.toUpperCase() === "NAS" ? "NAS" : `${sample.age} years`}</span></p>` : "";
            sampleHTML += sample.type ? `<p><strong>Type:</strong> <span class="sample-type">${sample.type}</span></p>` : "";
            sampleHTML += `<p><strong>Grootte:</strong> <span class="sample-size">${sample.size}</span> cl</p>`;
            sampleHTML += `<p><strong>Waarde:</strong> €&nbsp;<span class="sample-value">${parseFloat(sample.value).toFixed(2)}</span></p>`;
            sampleHTML += sample.cask ? `<p><strong>Cask:</strong> <span class="sample-cask">${sample.cask}</span></p>` : "";
            sampleHTML += sample.notes ? `<p><strong>Opmerkingen:</strong> <span class="sample-notes">${sample.notes}</span></p>` : "";

            // 🔹 Correcte Whiskybase weergave (FIXED)
            if (sample.whiskyBaseLink) {
                sampleHTML += `<p><strong>Whiskybase:</strong> <a class="sample-whiskybase" href="${sample.whiskyBaseLink}" target="_blank" rel="noopener noreferrer">Whiskybase</a></p>`;
            }

            if (isOwner) {
                sampleHTML += `
                    <button id="edit-btn-${doc.id}" onclick="enableEditMode('${doc.id}')">Bewerken</button>
                    <button onclick="deleteSample('${doc.id}')">Verwijderen</button>
                `;
            }

            sampleHTML += `</div>`;
            document.getElementById("sampleList").innerHTML += sampleHTML;
        });
    }).catch(error => {
        console.error("❌ Fout bij laden van samples:", error);
    });
};

// 🔹 Sample Verwijderen uit Database (FIXED)
window.deleteSample = function (id) {
    db.collection("samples").doc(id).delete().then(() => {
        alert("✅ Sample verwijderd!");
        loadSamples(); // Laad direct opnieuw zodat knoppen blijven werken
    }).catch(error => {
        console.error("❌ Fout bij verwijderen: ", error);
    });
};

console.log("✅ Script is volledig geladen!");
