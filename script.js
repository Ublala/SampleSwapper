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

            let sampleHTML = `
                <div class="sample-card" id="sample-${doc.id}">
                    <h3 class="sample-name">${sample.name}</h3>
            `;

            // ✅ Leeftijd tonen (met "years" als het een getal is)
            if (sample.age) {
                let formattedAge = sample.age.toUpperCase() === "NAS" ? "NAS" : `${sample.age} years`;
                sampleHTML += `<p class="sample-age"><strong>Leeftijd:</strong> ${formattedAge}</p>`;
            }

            if (sample.type) {
                sampleHTML += `<p class="sample-type"><strong>Type:</strong> ${sample.type}</p>`;
            }

            sampleHTML += `<p class="sample-size"><strong>Grootte:</strong> ${sample.size} cl</p>`;

            let value = parseFloat(sample.value);
            sampleHTML += `<p class="sample-value"><strong>Waarde:</strong> €&nbsp;${!isNaN(value) ? value.toFixed(2) : sample.value}</p>`;

            if (sample.cask) {
                sampleHTML += `<p class="sample-cask"><strong>Cask:</strong> ${sample.cask}</p>`;
            }

            if (sample.notes) {
                sampleHTML += `<p class="sample-notes"><strong>Opmerkingen:</strong> ${sample.notes}</p>`;
            }

            if (sample.whiskyBaseLink) {
                sampleHTML += `<p class="sample-whiskybase"><a href="${sample.whiskyBaseLink}" target="_blank" rel="noopener noreferrer">Whiskybase</a></p>`;
            }

            if (isOwner) {
                sampleHTML += `
                    <button id="edit-btn-${doc.id}" onclick="enableEditMode('${doc.id}')">Bewerken</button>
                    <button onclick="deleteSample('${doc.id}')">Verwijderen</button>
                `;
            }

            sampleHTML += `</div>`;

            document.getElementById("sampleList").innerHTML += sampleHTML;
            
            let sampleElement = document.createElement("div");
sampleElement.classList.add("sample-card");
sampleElement.id = `sample-${doc.id}`;  // ✅ Belangrijk! Dit zorgt ervoor dat de ID correct is
sampleElement.innerHTML = sampleHTML;

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

// 🔹 Voeg inline bewerkingsfunctionaliteit toe aan sample cards
window.enableEditMode = function (docId) {
    let sampleElement = document.getElementById(`sample-${docId}`);
    let editButton = document.getElementById(`edit-btn-${docId}`);

    let fields = [
        { class: "sample-name", type: "text" },
        { class: "sample-age", type: "text" },
        { class: "sample-type", type: "text" },
        { class: "sample-size", type: "number" },
        { class: "sample-value", type: "number", step: "0.01" },
        { class: "sample-cask", type: "text" },
        { class: "sample-notes", type: "text" },
        { class: "sample-whiskybase", type: "text" }
    ];

    fields.forEach(field => {
        let element = sampleElement.querySelector(`.${field.class}`);
        if (element) {
            let value = element.innerText.replace(" cl", "").replace("€", "").trim();
            let stepAttr = field.step ? `step="${field.step}"` : ""; 
            element.innerHTML = `<input type="${field.type}" value="${value}" class="edit-input" ${stepAttr}>`;
        }
    });

    // ✅ Wijzig de bewerkknop naar een opslaanknop
    editButton.innerText = "Opslaan";
    editButton.setAttribute("onclick", `saveSample('${docId}')`);
};

// 🔹 Functie om wijzigingen op te slaan
window.saveSample = function (docId) {
    let sampleElement = document.getElementById(`sample-${docId}`);
    let editButton = document.getElementById(`edit-btn-${docId}`);

    let updatedData = {};

    let fields = [
        { class: "sample-name", key: "name" },
        { class: "sample-age", key: "age" },
        { class: "sample-type", key: "type" },
        { class: "sample-size", key: "size" },
        { class: "sample-value", key: "value" },
        { class: "sample-cask", key: "cask" },
        { class: "sample-notes", key: "notes" },
        { class: "sample-whiskybase", key: "whiskyBaseLink" }
    ];

    fields.forEach(field => {
        let inputElement = sampleElement.querySelector(`.${field.class} input`);
        if (inputElement) {
            let value = inputElement.value.trim();
            if (field.key === "value") value = parseFloat(value);
            if (value) updatedData[field.key] = value;
        }
    });

    if (!updatedData.name || !updatedData.size || !updatedData.value) {
        alert("⚠️ Naam, grootte en waarde zijn verplicht!");
        return;
    }

    // ✅ Update Firestore
    db.collection("samples").doc(docId).update(updatedData)
        .then(() => {
            alert("✅ Sample bijgewerkt!");
            loadSamples(); // Herlaad de lijst om de wijzigingen te tonen
        })
        .catch(error => {
            console.error("❌ Fout bij bijwerken:", error);
            alert("❌ Er ging iets mis bij het opslaan.");
        });

    // ✅ Zet opslaanknop terug naar bewerkknop
    editButton.innerText = "Bewerken";
    editButton.setAttribute("onclick", `enableEditMode('${docId}')`);
};

    // Update Firestore
    db.collection("samples").doc(docId).update(updatedData)
        .then(() => {
            alert("✅ Sample bijgewerkt!");
            loadSamples();
        })
        .catch(error => {
            console.error("❌ Fout bij bijwerken:", error);
            alert("❌ Er ging iets mis bij het opslaan.");
        });

    // Zet opslaanknop terug naar bewerkknop
    editButton.innerText = "Bewerken";
    editButton.setAttribute("onclick", `enableEditMode('${docId}')`);
};

console.log("Script is volledig geladen!");
