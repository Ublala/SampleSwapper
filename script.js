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

            let sampleHTML = `<div id="sample-${doc.id}" class="sample-card">`;
            sampleHTML += `<h3 class="sample-name">${sample.name}</h3>`;

            if (sample.age) {
                let formattedAge = sample.age.toUpperCase() === "NAS" ? "NAS" : `${sample.age} years`;
                sampleHTML += `<p><strong>Leeftijd:</strong> <span class="sample-age">${formattedAge}</span></p>`;
            }

            if (sample.type) {
                sampleHTML += `<p><strong>Type:</strong> <span class="sample-type">${sample.type}</span></p>`;
            }

            sampleHTML += `<p><strong>Grootte:</strong> <span class="sample-size">${sample.size}</span> cl</p>`;
            let value = parseFloat(sample.value);
            sampleHTML += `<p><strong>Waarde:</strong> €&nbsp;<span class="sample-value">${!isNaN(value) ? value.toFixed(2) : sample.value}</span></p>`;

            if (sample.cask) {
                sampleHTML += `<p><strong>Cask:</strong> <span class="sample-cask">${sample.cask}</span></p>`;
            }

            if (sample.notes) {
                sampleHTML += `<p><strong>Opmerkingen:</strong> <span class="sample-notes">${sample.notes}</span></p>`;
            }

            if (sample.whiskyBaseLink) {
                sampleHTML += `<p><strong>Whiskybase:</strong> <a class="sample-whiskybase" href="${sample.whiskyBaseLink}" target="_blank" rel="noopener noreferrer">${sample.whiskyBaseLink}</a></p>`;
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

    let fields = {
        name: sampleElement.querySelector(".sample-name"),
        age: sampleElement.querySelector(".sample-age"),
        type: sampleElement.querySelector(".sample-type"),
        size: sampleElement.querySelector(".sample-size"),
        value: sampleElement.querySelector(".sample-value"),
        cask: sampleElement.querySelector(".sample-cask"),
        notes: sampleElement.querySelector(".sample-notes"),
        whiskyBase: sampleElement.querySelector(".sample-whiskybase a") // Zorgt ervoor dat de link correct wordt bewerkt
    };

    Object.keys(fields).forEach(key => {
        if (fields[key]) {
            let currentValue = fields[key].innerText || "";
            
            // Specifieke aanpassing voor de Whiskybase-link
            if (key === "whiskyBase") {
                currentValue = fields[key].getAttribute("href") || "";
            }

            fields[key].innerHTML = `<input type="text" value="${currentValue}" class="edit-input">`;

            // Zorg dat opmerkingenveld automatisch mee groeit
            if (key === "notes") {
                let textarea = document.createElement("textarea");
                textarea.classList.add("edit-input");
                textarea.value = currentValue;
                textarea.oninput = function () { autoResize(this); };
                fields[key].innerHTML = "";
                fields[key].appendChild(textarea);
                autoResize(textarea);
            }
        }
    });

    // Verander de bewerkknop naar opslaan
    editButton.innerText = "Opslaan";
    editButton.setAttribute("onclick", `saveSample('${docId}')`);

    // Annuleerknop toevoegen
    let cancelButton = document.createElement("button");
    cancelButton.innerText = "Annuleren";
    cancelButton.setAttribute("onclick", `cancelEdit('${docId}')`);
    cancelButton.id = `cancel-btn-${docId}`;
    sampleElement.appendChild(cancelButton);
};

// 🔹 Functie om wijzigingen op te slaan
window.saveSample = function (docId) {
    let sampleElement = document.getElementById(`sample-${docId}`);
    let editButton = document.getElementById(`edit-btn-${docId}`);

    let updatedData = {
        name: sampleElement.querySelector(".sample-name input").value.trim(),
        size: sampleElement.querySelector(".sample-size input").value.trim(),
        value: parseFloat(sampleElement.querySelector(".sample-value input").value.trim()),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    let optionalFields = ["age", "type", "cask", "notes", "whiskyBase"];
    optionalFields.forEach(field => {
        let inputElement = sampleElement.querySelector(`.sample-${field} input, .sample-${field} textarea`);
        if (inputElement) {
            let value = inputElement.value.trim();
            if (value) {
                updatedData[field] = field === "whiskyBase" ? value : value;
            }
        }
    });

    db.collection("samples").doc(docId).update(updatedData)
        .then(() => {
            alert("✅ Sample bijgewerkt!");
            enableViewMode(docId);
        })
        .catch(error => {
            console.error("❌ Fout bij bijwerken:", error);
            alert("❌ Er ging iets mis bij het opslaan.");
        });

    // Knoppen terugzetten naar bewerken
    editButton.innerText = "Bewerken";
    editButton.setAttribute("onclick", `enableEditMode('${docId}')`);

    let cancelButton = document.getElementById(`cancel-btn-${docId}`);
    if (cancelButton) cancelButton.remove();
};

window.cancelEdit = function (docId) {
    loadSamples(); // Herlaad de samples om de originele weergave terug te zetten
};

window.enableViewMode = function (docId) {
    let sampleElement = document.getElementById(`sample-${docId}`);
    let editButton = document.getElementById(`edit-btn-${docId}`);

    let sample = db.collection("samples").doc(docId).get().then(doc => {
        if (doc.exists) {
            let data = doc.data();

            sampleElement.querySelector(".sample-name").innerText = data.name;
            sampleElement.querySelector(".sample-age").innerText = data.age ? `${data.age} years` : "";
            sampleElement.querySelector(".sample-type").innerText = data.type || "";
            sampleElement.querySelector(".sample-size").innerText = `${data.size} cl`;
            sampleElement.querySelector(".sample-value").innerText = `€ ${parseFloat(data.value).toFixed(2)}`;
            sampleElement.querySelector(".sample-cask").innerText = data.cask || "";
            sampleElement.querySelector(".sample-notes").innerText = data.notes || "";
            
            if (data.whiskyBaseLink) {
                sampleElement.querySelector(".sample-whiskybase").innerHTML = `<a href="${data.whiskyBaseLink}" target="_blank">${data.whiskyBaseLink}</a>`;
            } else {
                sampleElement.querySelector(".sample-whiskybase").innerText = "Geen link";
            }

            // Knoppen terugzetten
            editButton.innerText = "Bewerken";
            editButton.setAttribute("onclick", `enableEditMode('${docId}')`);

            let cancelButton = document.getElementById(`cancel-btn-${docId}`);
            if (cancelButton) cancelButton.remove();
        }
    }).catch(error => {
        console.error("❌ Fout bij ophalen sample:", error);
    });
};

console.log("Script is volledig geladen!");
