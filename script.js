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

    let name = document.getElementById("whiskyName").value.trim();
    let age = document.getElementById("whiskyAge").value.trim();
    let type = document.getElementById("whiskyType").value.trim();
    let size = document.getElementById("whiskySize").value.trim();
    let value = document.getElementById("whiskyValue").value.trim();
    let whiskyBaseLink = document.getElementById("whiskyBaseLink").value.trim();
    let cask = document.getElementById("whiskyCask").value.trim();
    let notes = document.getElementById("whiskyNotes").value.trim();

    // ✅ Controleer of de verplichte velden zijn ingevuld
    if (name === "" || value === "" || size === "") {
        alert("⚠️ Naam, prijs en sample grootte zijn verplicht!");
        return;
    }

    // ✅ Controleer of prijs een geldig getal is
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        alert("⚠️ Voer een geldig bedrag in (alleen cijfers en optioneel een decimaal, bijvoorbeeld 12 of 12.50)");
        return;
    }

    // ✅ Controleer of leeftijd een getal of 'NAS' is
    if (age !== "" && !/^\d+$/.test(age) && age.toUpperCase() !== "NAS") {
        alert("⚠️ Leeftijd moet een getal zijn of 'NAS'.");
        return;
    }

    let sampleData = {
        name: name,
        size: size,  // Altijd opslaan
        value: parseFloat(value),  // Opslaan als getal
        userId: user.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    // ✅ Alleen opslaan als het veld niet leeg is
    if (age !== "") sampleData.age = age;
    if (type !== "") sampleData.type = type;
    if (whiskyBaseLink !== "") sampleData.whiskyBaseLink = whiskyBaseLink;
    if (cask !== "") sampleData.cask = cask;
    if (notes !== "") sampleData.notes = notes;

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
};

// 🔹 Samples Ophalen uit Database en Weergeven
window.loadSamples = function (user) {
    document.getElementById("sampleList").innerHTML = "";

    window.db.collection("samples").orderBy("timestamp", "desc").get().then(snapshot => {
        snapshot.forEach(doc => {
            let sample = doc.data();
            let isOwner = user && sample.userId === user.uid;

            let sampleHTML = `<h3>${sample.name}</h3>`;

            // ✅ Leeftijd tonen (apart en met 'years' als het een getal is)
            if (sample.age) {
                sampleHTML += `<p><strong>Leeftijd:</strong> ${isNaN(sample.age) ? sample.age : sample.age + " years"}</p>`;
            }

            if (sample.type) {
                sampleHTML += `<p><strong>Type:</strong> ${sample.type}</p>`;
            }

            sampleHTML += `<p><strong>Grootte:</strong> ${sample.size} cl</p>`; // Altijd tonen
           let value = parseFloat(sample.value);
sampleHTML += `<p><strong>Waarde:</strong> €${!isNaN(value) ? value.toFixed(2) : sample.value}</p>`;


            if (sample.cask) {
                sampleHTML += `<p><strong>Cask:</strong> ${sample.cask}</p>`;
            }

            if (sample.notes) {
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

console.log("Script is volledig geladen!");
