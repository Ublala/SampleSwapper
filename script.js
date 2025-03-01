// 🔹 Firebase Configuratie
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
window.auth = firebase.auth();
window.db = firebase.firestore();

// 🔹 Controleer of Firebase correct is geladen
console.log("✅ Firebase is geladen:", firebase);
console.log("✅ Firestore Database:", db);

// 🔹 Inloggen functionaliteit
window.login = function () {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("✅ Inloggen succesvol!");
            checkUser();
        })
        .catch(error => {
            console.error("❌ Fout bij inloggen:", error);
            alert("❌ Fout: " + error.message);
        });
};

// 🔹 Automatisch controleren of gebruiker ingelogd is
window.onload = () => {
    auth.onAuthStateChanged(user => {
        checkUser();
        loadSamples(user);
    });
};

// 🔹 Samples ophalen en weergeven
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
            
            // ✅ Corrigeer de Whiskybase-linkweergave
            if (sample.whiskyBaseLink) {
                sampleHTML += `<p><strong>Whiskybase:</strong> <a class="sample-whiskybase" href="${sample.whiskyBaseLink}" target="_blank">Whiskybase</a></p>`;
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

// 🔹 Inschakelen van bewerkingsmodus
window.enableEditMode = function (docId) {
    let sampleElement = document.getElementById(`sample-${docId}`);
    let editButton = document.getElementById(`edit-btn-${docId}`);

    let fields = ["name", "age", "type", "size", "value", "cask", "notes", "whiskyBase"];
    fields.forEach(field => {
        let fieldElement = sampleElement.querySelector(`.sample-${field}`);
        if (fieldElement) {
            let value = fieldElement.innerText || "";
            if (field === "whiskyBase") {
                let linkElement = fieldElement.querySelector("a");
                value = linkElement ? linkElement.getAttribute("href") : "";
            }
            fieldElement.innerHTML = `<input type="text" value="${value}" class="edit-input">`;

            if (field === "notes") {
                let textarea = document.createElement("textarea");
                textarea.classList.add("edit-input");
                textarea.value = value;
                textarea.oninput = function () { autoResize(this); };
                fieldElement.innerHTML = "";
                fieldElement.appendChild(textarea);
                autoResize(textarea);
            }
        }
    });

    // ✅ Zorg dat bewerkingsvelden op één regel staan
    let inputs = sampleElement.querySelectorAll(".edit-input");
    inputs.forEach(input => {
        input.style.display = "inline-block";
        input.style.marginRight = "10px";
    });

    // Vervang bewerkknop door opslaanknop + annuleerknop
    editButton.innerText = "Opslaan";
    editButton.setAttribute("onclick", `saveSample('${docId}')`);

    let cancelButton = document.createElement("button");
    cancelButton.innerText = "Annuleren";
    cancelButton.setAttribute("onclick", `cancelEdit('${docId}')`);
    cancelButton.id = `cancel-btn-${docId}`;
    sampleElement.appendChild(cancelButton);
};

// 🔹 Wijzigingen opslaan
window.saveSample = function (docId) {
    let sampleElement = document.getElementById(`sample-${docId}`);
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
                updatedData[field] = value;
            }
        }
    });

    db.collection("samples").doc(docId).update(updatedData)
        .then(() => {
            alert("✅ Sample bijgewerkt!");
            loadSamples();
        })
        .catch(error => {
            console.error("❌ Fout bij bijwerken:", error);
            alert("❌ Er ging iets mis bij het opslaan.");
        });
};

// 🔹 Sample verwijderen
window.deleteSample = function (id) {
    db.collection("samples").doc(id).delete().then(() => {
        alert("✅ Sample verwijderd!");
        loadSamples();
    }).catch(error => {
        console.error("❌ Fout bij verwijderen: ", error);
    });
};

console.log("✅ Script is volledig geladen!");