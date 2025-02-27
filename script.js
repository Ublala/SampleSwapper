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

// 🔹 Debug: Controleer of Firebase correct is geladen
console.log("✅ Firebase is geladen:", firebase);
console.log("✅ Firestore Database:", db);
console.log("✅ Firebase Authentication:", auth);

// 🔹 Functie om het tekstveld automatisch mee te laten groeien
window.autoResize = function (element) {
    element.style.height = "auto"; // Reset de hoogte eerst
    element.style.height = (element.scrollHeight) + "px"; // Pas de hoogte aan
};

// 🔹 Gebruiker Registreren
window.register = function () {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            let user = userCredential.user;
            user.sendEmailVerification()
                .then(() => {
                    alert("✅ Registratie succesvol! Verifieer je e-mail via de bevestigingsmail.");
                    checkUser();
                }).catch(error => {
                    console.error("❌ Fout bij het verzenden van de verificatie e-mail:", error);
                });
        })
        .catch(error => {
            console.error("❌ Fout bij registreren:", error);
            alert("❌ Fout: " + error.message);
        });
};

// 🔹 Gebruiker Inloggen
window.login = function () {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            alert("✅ Inloggen succesvol!");
            checkUser();
        })
        .catch(error => {
            console.error("❌ Fout bij inloggen:", error);
            alert("❌ Fout: " + error.message);
        });
};

// 🔹 Gebruiker Uitloggen
window.logout = function () {
    auth.signOut().then(() => {
        alert("✅ Je bent succesvol uitgelogd!");
        checkUser();
    }).catch(error => {
        console.error("❌ Fout bij uitloggen:", error);
        alert("❌ Er ging iets mis bij het uitloggen.");
    });
};

// 🔹 Controleer of een gebruiker ingelogd is
window.checkUser = function () {
    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById("userStatus").innerText = `✅ Ingelogd als: ${user.email}`;
            document.getElementById("authSection").style.display = "none"; // Verberg login-formulier
            document.getElementById("logoutButton").style.display = "block"; // Toon uitlogknop
        } else {
            document.getElementById("userStatus").innerText = "❌ Niet ingelogd";
            document.getElementById("authSection").style.display = "block"; // Toon login-formulier
            document.getElementById("logoutButton").style.display = "none"; // Verberg uitlogknop
        }
    });
};

// 🔹 Wachtwoord Resetten
window.resetPassword = function () {
    let email = document.getElementById("email").value;
    if (!email) {
        alert("⚠️ Voer je e-mailadres in om je wachtwoord te resetten.");
        return;
    }

    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert("📩 Wachtwoord reset e-mail is verzonden! Controleer je inbox.");
        })
        .catch(error => {
            console.error("❌ Fout bij wachtwoord reset:", error);
            alert("❌ Fout: " + error.message);
        });
};

// 🔹 Controleer automatisch bij opstarten of gebruiker ingelogd is
window.onload = () => {
    auth.onAuthStateChanged(user => {
        checkUser();  
        if (user) {
            console.log("🔍 Gebruiker ingelogd:", user.uid); // Debug-log
            loadSamples(user); // ✅ Stuur de gebruiker door naar `loadSamples()`
        } else {
            console.log("❌ Geen gebruiker ingelogd, samples worden zonder bewerkopties geladen.");
            loadSamples(null); // ✅ Laadt samples zonder eigenaar-controle
        }
    });
};

// 🔹 Sample Toevoegen aan Database
window.addSample = function () {
    let user = auth.currentUser;
    if (!user) {
        alert("❌ Je moet ingelogd zijn om een sample toe te voegen.");
        return;
    }

    let name = document.getElementById("whiskyName").value;
    let age = document.getElementById("whiskyAge").value;
    let type = document.getElementById("whiskyType").value;
    let size = document.getElementById("whiskySize").value;
    let value = document.getElementById("whiskyValue").value;
    let whiskyBaseLink = document.getElementById("whiskyBaseLink").value;
    let cask = document.getElementById("whiskyCask").value;
    let notes = document.getElementById("whiskyNotes").value;

    if (name.trim() === "" || value.trim() === "" || size.trim() === "") {
    alert("⚠️ Naam, prijs en sample grootte zijn verplicht!");
    return;
}

      let sampleData = {
    name: name.trim(),
    size: size.trim(), // Altijd opslaan, verplicht veld
    value: value.trim(), // Altijd opslaan, verplicht veld
    userId: user.uid,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
};

// Alleen opslaan als een veld daadwerkelijk is ingevuld
if (age.trim() !== "") sampleData.age = age.trim();
if (type.trim() !== "") sampleData.type = type.trim();
if (whiskyBaseLink.trim() !== "") sampleData.whiskyBaseLink = whiskyBaseLink.trim();
if (cask.trim() !== "") sampleData.cask = cask.trim();
if (notes.trim() !== "") sampleData.notes = notes.trim();

window.db.collection("samples").add(sampleData)
    .then(() => {
        alert("✅ Sample toegevoegd!");

        // Velden resetten
        document.getElementById("whiskyName").value = "";
        document.getElementById("whiskyAge").value = "";
        document.getElementById("whiskyType").value = "";
        document.getElementById("whiskySize").value = "";
        document.getElementById("whiskyValue").value = "";
        document.getElementById("whiskyBaseLink").value = "";
        document.getElementById("whiskyCask").value = "";
        document.getElementById("whiskyNotes").value = "";

        auth.onAuthStateChanged(updatedUser => {
            if (updatedUser) {
                loadSamples(updatedUser);
            }
        });
    }).catch(error => {
        console.error("❌ Fout bij toevoegen: ", error);
    });


// 🔹 Samples Ophalen uit Database en Weergeven
window.loadSamples = function (user) {
    document.getElementById("sampleList").innerHTML = "";

    window.db.collection("samples").orderBy("timestamp", "desc").get().then(snapshot => {
        snapshot.forEach(doc => {
            let sample = doc.data();
            let isOwner = user && sample.userId === user.uid;

            let sampleHTML = `<h3>${sample.name}${sample.age ? ` (${sample.age})` : ""}</h3>`;

            if (sample.type && sample.type !== "Onbekend") {
                sampleHTML += `<p><strong>Type:</strong> ${sample.type}</p>`;
            }

            sampleHTML += `<p><strong>Grootte:</strong> ${sample.size} cl</p>`; // Altijd tonen (verplicht veld)
            sampleHTML += `<p><strong>Waarde:</strong> ${sample.value}</p>`; // Altijd tonen (verplicht veld)

            if (sample.cask && sample.cask !== "Onbekend") {
                sampleHTML += `<p><strong>Cask:</strong> ${sample.cask}</p>`;
            }

            if (sample.notes && sample.notes !== "Geen opmerkingen") {
                sampleHTML += `<p><strong>Opmerkingen:</strong> ${sample.notes}</p>`;
            }

            if (sample.whiskyBaseLink) {
                sampleHTML += `<p><a href="${sample.whiskyBaseLink}" target="_blank" rel="noopener noreferrer">Whiskybase</a></p>`;
            }

            if (isOwner) {
                sampleHTML += `<button onclick="deleteSample('${doc.id}')">Verwijderen</button>`;
            }

            let sampleElement = document.createElement("div");
            sampleElement.classList.add("sample-card");
            sampleElement.innerHTML = sampleHTML;

            document.getElementById("sampleList").appendChild(sampleElement);
        });
    });
};

// 🔹 Sample Verwijderen uit Database
window.deleteSample = function (id) {
    db.collection("samples").doc(id).delete().then(() => {
        alert("✅ Sample verwijderd!");
        loadSamples();
    }).catch(error => {
        console.error("❌ Fout bij verwijderen: ", error);
    });
};
