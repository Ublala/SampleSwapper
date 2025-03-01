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

// 🔹 Controleer of een gebruiker is ingelogd en pas UI aan
window.checkUser = function () {
    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById("userStatus").innerText = `✅ Ingelogd als: ${user.email}`;
            document.getElementById("logoutButton").style.display = "block";
            loadSamples(user);
        } else {
            document.getElementById("userStatus").innerText = "❌ Niet ingelogd";
            document.getElementById("logoutButton").style.display = "none";
            loadSamples(null);
        }
    });
};

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

// 🔹 Uitloggen functionaliteit
window.logout = function () {
    auth.signOut().then(() => {
        alert("✅ Uitgelogd!");
        window.location.reload(); // ✅ Voorkomt verdubbeling van samplecards
    }).catch(error => {
        console.error("❌ Fout bij uitloggen:", error);
    });
};

// 🔹 Automatisch controleren of gebruiker ingelogd is bij opstarten
window.onload = () => {
    checkUser();
};

// 🔹 Samples ophalen en weergeven
window.loadSamples = function (user) {
    let sampleList = document.getElementById("sampleList");
    sampleList.innerHTML = ""; // ✅ Voorkomt verdubbeling van kaarten

    window.db.collection("samples").orderBy("timestamp", "desc").get().then(snapshot => {
        snapshot.forEach(doc => {
            let sample = doc.data();
            let isOwner = user && sample.userId === user.uid;

            let sampleHTML = `<div id="sample-${doc.id}" class="sample-card">`;
            sampleHTML += `<h3><strong>Whisky:</strong> <span class="sample-name">${sample.name}</span></h3>`;
            sampleHTML += `<p><strong>Leeftijd:</strong> <span class="sample-age">${sample.age ? sample.age.replace(/ years/g, '') + " years" : ""}</span></p>`;
            sampleHTML += `<p><strong>Type:</strong> <span class="sample-type">${sample.type || ""}</span></p>`;
            sampleHTML += `<p><strong>Grootte:</strong> <span class="sample-size">${sample.size}</span> cl</p>`;
            sampleHTML += `<p><strong>Waarde:</strong> €&nbsp;<span class="sample-value">${parseFloat(sample.value).toFixed(2)}</span></p>`;
            sampleHTML += `<p><strong>Cask:</strong> <span class="sample-cask">${sample.cask || ""}</span></p>`;
            sampleHTML += `<p><strong>Opmerkingen:</strong> <span class="sample-notes">${sample.notes || ""}</span></p>`;

            // ✅ Correcte weergave van de Whiskybase-link ZONDER AANHEF
            if (sample.whiskyBaseLink) {
                sampleHTML += `<p><a href="${sample.whiskyBaseLink}" target="_blank" rel="noopener noreferrer">Whiskybase</a></p>`;
            }

            if (isOwner) {
                sampleHTML += `
                    <button id="edit-btn-${doc.id}" onclick="enableEditMode('${doc.id}')">Bewerken</button>
                    <button onclick="deleteSample('${doc.id}')">Verwijderen</button>
                `;
            }

            sampleHTML += `</div>`;
            sampleList.innerHTML += sampleHTML;
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
        let value = fieldElement ? fieldElement.innerText.trim() : "";

        if (field === "whiskyBase") {
            let linkElement = fieldElement.querySelector("a");
            value = linkElement ? linkElement.getAttribute("href") : "";
        }

        if (field === "notes") {
            fieldElement.innerHTML = `<textarea class="edit-input" oninput="autoResize(this)">${value}</textarea>`;
        } else {
            fieldElement.innerHTML = `<input type="text" value="${value}" class="edit-input">`;
        }
    });

    editButton.innerText = "Opslaan";
    editButton.setAttribute("onclick", `saveSample('${docId}')`);

    let cancelButton = document.createElement("button");
    cancelButton.innerText = "Annuleren";
    cancelButton.setAttribute("onclick", `loadSamples()`);
    sampleElement.appendChild(cancelButton);
};

// 🔹 Automatisch hoogte aanpassen voor opmerkingenveld
window.autoResize = function (element) {
    element.style.height = "auto";
    element.style.height = (element.scrollHeight) + "px";
};

// 🔹 Sample verwijderen
window.deleteSample = function (id) {
    db.collection("samples").doc(id).delete().then(() => {
        alert("✅ Sample verwijderd!");
        loadSamples(); // ✅ Voorkomt dat knoppen verdwijnen
    }).catch(error => {
        console.error("❌ Fout bij verwijderen: ", error);
    });
};

console.log("✅ Script is volledig geladen!");
