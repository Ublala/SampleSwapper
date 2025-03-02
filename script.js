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
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;

// 🔹 Controleer of een gebruiker is ingelogd en pas UI aan
function checkUser() {
    auth.onAuthStateChanged(user => {
        currentUser = user;
        const addSampleForm = document.getElementById("addSampleForm");
        const samplesContainer = document.getElementById("samplesContainer");
        const userStatus = document.getElementById("userStatus");
        const logoutButton = document.getElementById("logoutButton");
        
        if (user) {
            userStatus.innerText = `✅ Ingelogd als: ${user.email}`;
            logoutButton.style.display = "block";
            addSampleForm.style.display = "block";
            samplesContainer.style.display = "block";
            loadSamples();
        } else {
            userStatus.innerText = "❌ Niet ingelogd";
            logoutButton.style.display = "none";
            addSampleForm.style.display = "none";
            samplesContainer.style.display = "none";
            document.getElementById("sampleList").innerHTML = "";
        }
    });
}

// 🔹 Registreren functionaliteit
function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (!email || !password) {
        alert("❌ Vul een geldig e-mailadres en wachtwoord in.");
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert("✅ Registratie succesvol! Je bent nu ingelogd.");
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";
        })
        .catch(error => {
            console.error("❌ Fout bij registreren:", error);
            alert("❌ Fout: " + error.message);
        });
}

// 🔹 Inloggen functionaliteit
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (!email || !password) {
        alert("❌ Vul een geldig e-mailadres en wachtwoord in.");
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("✅ Inloggen succesvol!");
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";
        })
        .catch(error => {
            console.error("❌ Fout bij inloggen:", error);
            alert("❌ Fout: " + error.message);
        });
}

// 🔹 Wachtwoord reset functionaliteit
function resetPassword() {
    const email = document.getElementById("email").value;
    
    if (!email) {
        alert("❌ Vul je e-mailadres in voor het resetten van je wachtwoord.");
        return;
    }
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert("✅ Er is een wachtwoord reset e-mail verzonden naar je e-mailadres.");
        })
        .catch(error => {
            console.error("❌ Fout bij wachtwoord reset:", error);
            alert("❌ Fout: " + error.message);
        });
}

// 🔹 Uitloggen functionaliteit
function logout() {
    auth.signOut()
        .then(() => {
            alert("✅ Uitgelogd!");
        })
        .catch(error => {
            console.error("❌ Fout bij uitloggen:", error);
            alert("❌ Fout: " + error.message);
        });
}

// 🔹 Samples ophalen en weergeven
function loadSamples() {
    if (!currentUser) return;
    
    const sampleList = document.getElementById("sampleList");
    sampleList.innerHTML = ""; // Voorkomt dubbele kaarten
    
    db.collection("samples")
        .orderBy("timestamp", "desc")
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                sampleList.innerHTML = "<p>Geen samples beschikbaar. Voeg je eerste sample toe!</p>";
                return;
            }
            
            snapshot.forEach(doc => {
                const sample = doc.data();
                const isOwner = sample.userId === currentUser.uid;
                
                let sampleHTML = `<div id="sample-${doc.id}" class="sample-card">`;
                sampleHTML += `<p><strong>Whisky:</strong> <span class="sample-name">${sample.name || ""}</span></p>`;
                
                if (sample.age) {
                    // Verwijder mogelijke dubbele "years" en zorg voor juiste weergave
                    const ageText = sample.age.replace(/\s*years\s*/gi, "").trim();
                    sampleHTML += `<p><strong>Leeftijd:</strong> <span class="sample-age">${ageText ? ageText + " years" : ""}</span></p>`;
                } else {
                    sampleHTML += `<p><strong>Leeftijd:</strong> <span class="sample-age"></span></p>`;
                }
                
                sampleHTML += `<p><strong>Type:</strong> <span class="sample-type">${sample.type || ""}</span></p>`;
                sampleHTML += `<p><strong>Grootte:</strong> <span class="sample-size">${sample.size || ""}</span> cl</p>`;
                sampleHTML += `<p><strong>Waarde:</strong> €&nbsp;<span class="sample-value">${parseFloat(sample.value || 0).toFixed(2)}</span></p>`;
                sampleHTML += `<p><strong>Cask:</strong> <span class="sample-cask">${sample.cask || ""}</span></p>`;
                sampleHTML += `<p><strong>Opmerkingen:</strong> <span class="sample-notes">${sample.notes || ""}</span></p>`;
                
                // Correcte weergave van de Whiskybase-link
                if (sample.whiskyBaseLink) {
                    sampleHTML += `<p><a href="${sample.whiskyBaseLink}" target="_blank" rel="noopener noreferrer" class="sample-whiskyBaseLink">Whiskybase</a></p>`;
                } else {
                    sampleHTML += `<p><span class="sample-whiskyBaseLink"></span></p>`;
                }
                
                // Bewerkingsknoppen alleen tonen voor de eigenaar
                if (isOwner) {
                    sampleHTML += `
                        <div class="sample-buttons">
                            <button id="edit-btn-${doc.id}" onclick="enableEditMode('${doc.id}')">Bewerken</button>
                            <button onclick="deleteSample('${doc.id}')">Verwijderen</button>
                        </div>
                    `;
                }
                
                sampleHTML += `</div>`;
                sampleList.innerHTML += sampleHTML;
            });
        })
        .catch(error => {
            console.error("❌ Fout bij laden van samples:", error);
            sampleList.innerHTML = "<p>Er is een fout opgetreden bij het laden van samples.</p>";
        });
}

// 🔹 Sample toevoegen
function addSample() {
    if (!currentUser) {
        alert("❌ Je moet ingelogd zijn om een sample toe te voegen.");
        return;
    }
    
    const whiskyName = document.getElementById("whiskyName").value.trim();
    const whiskySize = document.getElementById("whiskySize").value.trim();
    const whiskyValue = document.getElementById("whiskyValue").value.trim();
    
    if (!whiskyName || !whiskySize || !whiskyValue) {
        alert("❌ Vul ten minste de whisky naam, grootte en waarde in.");
        return;
    }
    
    // Verzamel alle gegevens voor de nieuwe sample
    const sampleData = {
        name: whiskyName,
        type: document.getElementById("whiskyType").value.trim(),
        age: document.getElementById("whiskyAge").value.trim(),
        cask: document.getElementById("whiskyCask").value.trim(),
        size: whiskySize,
        value: parseFloat(whiskyValue),
        whiskyBaseLink: document.getElementById("whiskyBaseLink").value.trim(),
        notes: document.getElementById("whiskyNotes").value.trim(),
        userId: currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Voeg de sample toe aan Firestore
    db.collection("samples").add(sampleData)
        .then(() => {
            alert("✅ Sample succesvol toegevoegd!");
            
            // Reset formuliervelden
            document.getElementById("whiskyName").value = "";
            document.getElementById("whiskyType").value = "";
            document.getElementById("whiskyAge").value = "";
            document.getElementById("whiskyCask").value = "";
            document.getElementById("whiskySize").value = "";
            document.getElementById("whiskyValue").value = "";
            document.getElementById("whiskyBaseLink").value = "";
            document.getElementById("whiskyNotes").value = "";
            
            // Laad samples opnieuw
            loadSamples();
        })
        .catch(error => {
            console.error("❌ Fout bij toevoegen van sample:", error);
            alert("❌ Fout: " + error.message);
        });
}

// 🔹 Inschakelen van bewerkingsmodus
function enableEditMode(docId) {
    const sampleElement = document.getElementById(`sample-${docId}`);
    const editButton = document.getElementById(`edit-btn-${docId}`);
    
    // Haal alle elementen op die we willen bewerken
    const nameElement = sampleElement.querySelector(".sample-name");
    const ageElement = sampleElement.querySelector(".sample-age");
    const typeElement = sampleElement.querySelector(".sample-type");
    const sizeElement = sampleElement.querySelector(".sample-size");
    const valueElement = sampleElement.querySelector(".sample-value");
    const caskElement = sampleElement.querySelector(".sample-cask");
    const notesElement = sampleElement.querySelector(".sample-notes");
    const whiskyBaseLinkElement = sampleElement.querySelector(".sample-whiskyBaseLink");
    
    // Bereid de waarden voor (verwijder eventuele labels en eenheden)
    const name = nameElement.innerText.trim();
    const age = ageElement.innerText.replace(/\s*years\s*/gi, "").trim();
    const type = typeElement.innerText.trim();
    const size = sizeElement.innerText.trim();
    const value = valueElement.innerText.trim();
    const cask = caskElement.innerText.trim();
    const notes = notesElement.innerText.trim();
    
    // Haal Whiskybase link op (als die er is)
    let whiskyBaseLink = "";
    if (whiskyBaseLinkElement.tagName === "A") {
        whiskyBaseLink = whiskyBaseLinkElement.getAttribute("href");
    } else if (whiskyBaseLinkElement.querySelector("a")) {
        whiskyBaseLink = whiskyBaseLinkElement.querySelector("a").getAttribute("href");
    }
    
    // Vervang de tekst door invoervelden
    nameElement.innerHTML = `<input type="text" value="${name}" class="edit-input">`;
    ageElement.innerHTML = `<input type="text" value="${age}" class="edit-input">`;
    typeElement.innerHTML = `<input type="text" value="${type}" class="edit-input">`;
    sizeElement.innerHTML = `<input type="number" value="${size}" class="edit-input" min="1">`;
    valueElement.innerHTML = `<input type="text" value="${value}" class="edit-input">`;
    caskElement.innerHTML = `<input type="text" value="${cask}" class="edit-input">`;
    notesElement.innerHTML = `<textarea class="edit-input" oninput="autoResize(this)">${notes}</textarea>`;
    
    // Hulpfunctie om de Whiskybase link te bewerken - zelfs als er geen was
    whiskyBaseLinkElement.innerHTML = `<input type="url" value="${whiskyBaseLink}" class="edit-input" placeholder="Link naar Whiskybase">`;
    
    // Verander de knoppen
    editButton.innerText = "Opslaan";
    editButton.setAttribute("onclick", `saveSample('${docId}')`);
    
    // Voeg een annuleerknop toe als deze er nog niet is
    if (!document.getElementById(`cancel-btn-${docId}`)) {
        const cancelButton = document.createElement("button");
        cancelButton.innerText = "Annuleren";
        cancelButton.setAttribute("onclick", `cancelEdit('${docId}')`);
        cancelButton.id = `cancel-btn-${docId}`;
        sampleElement.querySelector(".sample-buttons").appendChild(cancelButton);
    }
    
    // Auto-resize voor de textarea
    autoResize(sampleElement.querySelector("textarea"));
}

// 🔹 Annuleren van bewerkingsmodus
function cancelEdit(docId) {
    // We laden gewoon alles opnieuw
    loadSamples();
}

// 🔹 Sample opslaan na bewerking
function saveSample(docId) {
    const sampleElement = document.getElementById(`sample-${docId}`);
    
    // Haal de waarden op uit de invoervelden
    const name = sampleElement.querySelector(".sample-name input").value.trim();
    const age = sampleElement.querySelector(".sample-age input").value.trim();
    const type = sampleElement.querySelector(".sample-type input").value.trim();
    const size = sampleElement.querySelector(".sample-size input").value.trim();
    const value = sampleElement.querySelector(".sample-value input").value.trim();
    const cask = sampleElement.querySelector(".sample-cask input").value.trim();
    const notes = sampleElement.querySelector(".sample-notes textarea").value.trim();
    const whiskyBaseLink = sampleElement.querySelector(".sample-whiskyBaseLink input").value.trim();
    
    // Valideer verplichte velden
    if (!name || !size || !value) {
        alert("❌ Whisky naam, grootte en waarde zijn verplicht.");
        return;
    }
    
    // Bereid de gegevens voor
    const updatedData = {
        name: name,
        size: size,
        value: parseFloat(value),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Voeg optionele velden toe als ze niet leeg zijn
    if (age) updatedData.age = age;
    if (type) updatedData.type = type;
    if (cask) updatedData.cask = cask;
    if (notes) updatedData.notes = notes;
    if (whiskyBaseLink) updatedData.whiskyBaseLink = whiskyBaseLink;
    
    // Update de sample in de database
    db.collection("samples").doc(docId).update(updatedData)
        .then(() => {
            alert("✅ Sample bijgewerkt!");
            loadSamples();
        })
        .catch(error => {
            console.error("❌ Fout bij bijwerken:", error);
            alert("❌ Fout: " + error.message);
        });
}

// 🔹 Sample verwijderen
function deleteSample(docId) {
    if (confirm("Weet je zeker dat je deze sample wilt verwijderen?")) {
        db.collection("samples").doc(docId).delete()
            .then(() => {
                alert("✅ Sample verwijderd!");
                loadSamples();
            })
            .catch(error => {
                console.error("❌ Fout bij verwijderen: ", error);
                alert("❌ Fout: " + error.message);
            });
    }
}

// 🔹 Automatisch hoogte aanpassen voor opmerkingenveld
function autoResize(element) {
    if (!element) return;
    
    element.style.height = "auto";
    element.style.height = (element.scrollHeight) + "px";
}

// Automatisch controleren of gebruiker ingelogd is bij opstarten
window.onload = () => {
    // Initialiseer autoresize voor alle textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        autoResize(textarea);
        textarea.addEventListener('input', function() {
            autoResize(this);
        });
    });
    
    // Controleer gebruikersstatus
    checkUser();
};

// Exporteer de functie voor gebruik in HTML
window.register = register;
window.login = login;
window.resetPassword = resetPassword;
window.logout = logout;
window.addSample = addSample;
window.enableEditMode = enableEditMode;
window.cancelEdit = cancelEdit;
window.saveSample = saveSample;
window.deleteSample = deleteSample;
window.autoResize = autoResize;

console.log("✅ Script is volledig geladen!");
