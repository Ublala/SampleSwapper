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
        const logoutButton = document.getElementById("logoutButton");
        const userStatus = document.getElementById("userStatus");
        const addSampleForm = document.getElementById("addSampleForm");
        
        if (user) {
            userStatus.innerText = `✅ Ingelogd als: ${user.email}`;
            logoutButton.style.display = "block";
            addSampleForm.style.display = "block";
            loadSamples(user);
        } else {
            userStatus.innerText = "❌ Niet ingelogd";
            logoutButton.style.display = "none";
            addSampleForm.style.display = "none";
            loadSamplesForGuests();
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

// 🔹 Samples ophalen en weergeven voor ingelogde gebruikers
function loadSamples(user) {
    if (!user) return;
    
    const sampleList = document.getElementById("sampleList");
    sampleList.innerHTML = "";
    
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
                const isOwner = sample.userId === user.uid;
                
                let sampleHTML = `<div id="sample-${doc.id}" class="sample-card">`;
                
                // Voeg de velden toe die altijd getoond moeten worden
                sampleHTML += `<p><strong>Whisky:</strong> <span class="sample-name">${sample.name || ""}</span></p>`;
                
                // Voeg optionele velden toe als ze bestaan
                if (sample.age && sample.age.trim()) {
                    const ageText = sample.age.replace(/\s*years\s*/gi, "").trim();
                    sampleHTML += `<p><strong>Leeftijd:</strong> <span class="sample-age">${ageText ? ageText + " years" : ""}</span></p>`;
                }
                
                if (sample.type && sample.type.trim()) {
                    sampleHTML += `<p><strong>Type:</strong> <span class="sample-type">${sample.type}</span></p>`;
                }
                
                if (sample.cask && sample.cask.trim()) {
                    sampleHTML += `<p><strong>Cask:</strong> <span class="sample-cask">${sample.cask}</span></p>`;
                }
                
                sampleHTML += `<p><strong>Grootte:</strong> <span class="sample-size">${sample.size || ""}</span> cl</p>`;
                sampleHTML += `<p><strong>Prijs:</strong> €&nbsp;<span class="sample-value">${parseFloat(sample.value || 0).toFixed(2)}</span></p>`;
                
                if (sample.notes && sample.notes.trim()) {
                    sampleHTML += `<p><strong>Opmerkingen:</strong> <span class="sample-notes">${sample.notes}</span></p>`;
                }
                
                // Whiskybase link ZONDER label
                if (sample.whiskyBaseLink && sample.whiskyBaseLink.trim()) {
                    sampleHTML += `<p class="whiskybase-link-container">
                                       <a href="${sample.whiskyBaseLink}" target="_blank" rel="noopener noreferrer" class="sample-whiskyBaseLink">Whiskybase</a>
                                   </p>`;
                }
                
                // Voeg knoppen toe voor de eigenaar
                if (isOwner) {
                    sampleHTML += `
                        <div class="sample-buttons">
                            <button onclick="enableEditMode('${doc.id}')">Bewerken</button>
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

// 🔹 Samples ophalen en weergeven voor niet-ingelogde gebruikers
function loadSamplesForGuests() {
    const sampleList = document.getElementById("sampleList");
    sampleList.innerHTML = "";
    
    db.collection("samples")
        .orderBy("timestamp", "desc")
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                sampleList.innerHTML = "<p>Geen samples beschikbaar.</p>";
                return;
            }
            
            snapshot.forEach(doc => {
                const sample = doc.data();
                
                let sampleHTML = `<div id="sample-${doc.id}" class="sample-card">`;
                
                // Voeg de velden toe die altijd getoond moeten worden
                sampleHTML += `<p><strong>Whisky:</strong> <span class="sample-name">${sample.name || ""}</span></p>`;
                
                // Voeg optionele velden toe als ze bestaan
                if (sample.age && sample.age.trim()) {
                    const ageText = sample.age.replace(/\s*years\s*/gi, "").trim();
                    sampleHTML += `<p><strong>Leeftijd:</strong> <span class="sample-age">${ageText ? ageText + " years" : ""}</span></p>`;
                }
                
                if (sample.type && sample.type.trim()) {
                    sampleHTML += `<p><strong>Type:</strong> <span class="sample-type">${sample.type}</span></p>`;
                }
                
                if (sample.cask && sample.cask.trim()) {
                    sampleHTML += `<p><strong>Cask:</strong> <span class="sample-cask">${sample.cask}</span></p>`;
                }
                
                sampleHTML += `<p><strong>Grootte:</strong> <span class="sample-size">${sample.size || ""}</span> cl</p>`;
                sampleHTML += `<p><strong>Prijs:</strong> €&nbsp;<span class="sample-value">${parseFloat(sample.value || 0).toFixed(2)}</span></p>`;
                
                if (sample.notes && sample.notes.trim()) {
                    sampleHTML += `<p><strong>Opmerkingen:</strong> <span class="sample-notes">${sample.notes}</span></p>`;
                }
                
                // Whiskybase link ZONDER label
                if (sample.whiskyBaseLink && sample.whiskyBaseLink.trim()) {
                    sampleHTML += `<p class="whiskybase-link-container">
                                       <a href="${sample.whiskyBaseLink}" target="_blank" rel="noopener noreferrer" class="sample-whiskyBaseLink">Whiskybase</a>
                                   </p>`;
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
    
    // Valideer verplichte velden
    if (!whiskyName || !whiskySize || !whiskyValue) {
        alert("❌ Vul ten minste de whisky naam, grootte en prijs in.");
        return;
    }
    
    // Normaliseer de prijs (accepteer zowel ',' als '.' als decimaalscheider)
    const normalizedValue = whiskyValue.replace(',', '.');
    
    // Verzamel alle gegevens voor de nieuwe sample
    const sampleData = {
        name: whiskyName,
        age: document.getElementById("whiskyAge").value.trim(),
        type: document.getElementById("whiskyType").value.trim(),
        cask: document.getElementById("whiskyCask").value.trim(),
        size: whiskySize,
        value: parseFloat(normalizedValue),
        notes: document.getElementById("whiskyNotes").value.trim(),
        whiskyBaseLink: document.getElementById("whiskyBaseLink").value.trim(),
        userId: currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Voeg de sample toe aan Firestore
    db.collection("samples").add(sampleData)
        .then(() => {
            alert("✅ Sample succesvol toegevoegd!");
            
            // Reset formuliervelden
            document.getElementById("whiskyName").value = "";
            document.getElementById("whiskyAge").value = "";
            document.getElementById("whiskyType").value = "";
            document.getElementById("whiskyCask").value = "";
            document.getElementById("whiskySize").value = "";
            document.getElementById("whiskyValue").value = "";
            document.getElementById("whiskyNotes").value = "";
            document.getElementById("whiskyBaseLink").value = "";
            
            // Laad samples opnieuw
            loadSamples(currentUser);
        })
        .catch(error => {
            console.error("❌ Fout bij toevoegen van sample:", error);
            alert("❌ Fout: " + error.message);
        });
}

// 🔹 Inschakelen van bewerkingsmodus
function enableEditMode(docId) {
    console.log("Edit mode enabled for sample:", docId);
    
    const sampleElement = document.getElementById(`sample-${docId}`);
    if (!sampleElement) {
        console.error("Sample element niet gevonden");
        return;
    }
    
    // Haal alle zichtbare elementen op
    const nameElement = sampleElement.querySelector(".sample-name");
    const ageElement = sampleElement.querySelector(".sample-age");
    const typeElement = sampleElement.querySelector(".sample-type");
    const caskElement = sampleElement.querySelector(".sample-cask");
    const sizeElement = sampleElement.querySelector(".sample-size");
    const valueElement = sampleElement.querySelector(".sample-value");
    const notesElement = sampleElement.querySelector(".sample-notes");
    const whiskyBaseLinkElement = sampleElement.querySelector(".sample-whiskyBaseLink");
    
    // Verzamel de huidige waarden
    const name = nameElement ? nameElement.textContent.trim() : "";
    const age = ageElement ? ageElement.textContent.replace(/\s*years\s*/gi, "").trim() : "";
    const type = typeElement ? typeElement.textContent.trim() : "";
    const cask = caskElement ? caskElement.textContent.trim() : "";
    const size = sizeElement ? sizeElement.textContent.trim() : "";
    const value = valueElement ? valueElement.textContent.trim() : "";
    const notes = notesElement ? notesElement.textContent.trim() : "";
    
    // Haal whiskybase link op als die er is
    let whiskyBaseLink = "";
    if (whiskyBaseLinkElement && whiskyBaseLinkElement.tagName === "A") {
        whiskyBaseLink = whiskyBaseLinkElement.getAttribute("href");
    }
    
    // Maak bewerkingsvelden voor alle velden met sterretjes voor verplichte velden
    let editHTML = `<div class="edit-form">`;
    editHTML += `<p><strong class="required">Whisky:</strong> <input type="text" class="edit-input edit-name" value="${name}"></p>`;
    editHTML += `<p><strong>Leeftijd:</strong> <input type="text" class="edit-input edit-age" value="${age}"></p>`;
    editHTML += `<p><strong>Type:</strong> <input type="text" class="edit-input edit-type" value="${type}"></p>`;
    editHTML += `<p><strong>Cask:</strong> <input type="text" class="edit-input edit-cask" value="${cask}"></p>`;
    editHTML += `<p><strong class="required">Grootte:</strong> <input type="number" class="edit-input edit-size" value="${size}" min="1"></p>`;
    editHTML += `<p><strong class="required">Prijs:</strong> <input type="text" class="edit-input edit-value" value="${value}"></p>`;
    editHTML += `<p><strong>Opmerkingen:</strong> <textarea class="edit-input edit-notes" oninput="autoResize(this)">${notes}</textarea></p>`;
    editHTML += `<p><strong>Link naar Whiskybase:</strong> <input type="url" class="edit-input edit-whiskybase" value="${whiskyBaseLink}"></p>`;
    
    editHTML += `<div class="edit-buttons">
                    <button onclick="saveSample('${docId}')">Opslaan</button>
                    <button onclick="cancelEdit('${docId}')">Annuleren</button>
                    <button onclick="deleteSample('${docId}')">Verwijderen</button>
                </div></div>`;
    
    // Vervang de huidige inhoud door de bewerkingsvorm
    sampleElement.innerHTML = editHTML;
    
    // Zorg dat de textarea meegroeit
    const textarea = sampleElement.querySelector("textarea");
    if (textarea) {
        autoResize(textarea);
    }
}

// 🔹 Annuleren van bewerkingsmodus
function cancelEdit(docId) {
    loadSamples(currentUser);
}

// 🔹 Sample opslaan na bewerking
function saveSample(docId) {
    const sampleElement = document.getElementById(`sample-${docId}`);
    if (!sampleElement) {
        alert("❌ Sample niet gevonden!");
        return;
    }
    
    // Haal waarden op en verwijder mogelijke dubbele labels
    const name = sampleElement.querySelector(".edit-name").value.trim().replace(/^(Type:|Whisky:)\s*/i, "");
    const age = sampleElement.querySelector(".edit-age").value.trim().replace(/^(Leeftijd:)\s*/i, "");
    const type = sampleElement.querySelector(".edit-type").value.trim().replace(/^(Type:)\s*/i, "");
    const cask = sampleElement.querySelector(".edit-cask").value.trim().replace(/^(Cask:)\s*/i, "");
    const size = sampleElement.querySelector(".edit-size").value.trim().replace(/^(Grootte:)\s*/i, "");
    const value = sampleElement.querySelector(".edit-value").value.trim().replace(/^(Prijs:|€)\s*/i, "");
    const notes = sampleElement.querySelector(".edit-notes").value.trim().replace(/^(Opmerkingen:)\s*/i, "");
    const whiskyBaseLink = sampleElement.querySelector(".edit-whiskybase").value.trim();
    
    // Valideer verplichte velden
    if (!name || !size || !value) {
        alert("❌ Whisky naam, grootte en prijs zijn verplicht.");
        return;
    }
    
    // Normaliseer waarde
    const normalizedValue = value.replace(',', '.');
    
    // Bereid data voor
    const updatedData = {
        name: name,
        size: size,
        value: parseFloat(normalizedValue),
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
            loadSamples(currentUser);
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
                loadSamples(currentUser);
            })
            .catch(error => {
                console.error("❌ Fout bij verwijderen:", error);
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

// Zorg ervoor dat alle functies beschikbaar zijn in het window-object
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
