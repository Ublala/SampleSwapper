// 🔹 Firebase Config (Vervang met jouw Firebase gegevens)
const firebaseConfig = {
    apiKey: "AIzaSyAhKPrwi66YsMtxnpeINOfVT0LC67KG5tw",
    authDomain: "sampleswapper.firebaseapp.com",
    projectId: "sampleswapper",
    storageBucket: "sampleswapper.firebasestorage.com",
    messagingSenderId: "30622034305",
    appId: "1:30622034305:web:c11d34889c902304e3e080"
    
};

// 🔹 Firebase Initialiseren
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Firestore Database gebruiken

// 🔹 Sample Toevoegen aan Database
function addSample() {
    let name = document.getElementById("whiskyName").value;
    let age = document.getElementById("whiskyAge").value;
    let type = document.getElementById("whiskyType").value;
    let value = document.getElementById("whiskyValue").value;

    if (name === "" || age === "" || type === "" || value === "") {
        alert("Vul alle velden in!");
        return;
    }

    db.collection("samples").add({
        name: name,
        age: age,
        type: type,
        value: value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Sample toegevoegd!");
        loadSamples(); // Samples herladen
    }).catch(error => {
        console.error("Fout bij toevoegen: ", error);
    });
}

// 🔹 Samples Ophalen uit Database en Weergeven
function loadSamples() {
    document.getElementById("sampleList").innerHTML = ""; // Lijst leegmaken

    db.collection("samples").orderBy("timestamp", "desc").get().then(snapshot => {
        snapshot.forEach(doc => {
            let sample = doc.data();
            document.getElementById("sampleList").innerHTML += `
                <div class="sample-card">
                    <h3>${sample.name} (${sample.age})</h3>
                    <p><strong>Type:</strong> ${sample.type}</p>
                    <p><strong>Waarde:</strong> ${sample.value}</p>
                    <button onclick="deleteSample('${doc.id}')">Verwijderen</button>
                </div>
            `;
        });
    });
}

// 🔹 Sample Verwijderen uit Database
function deleteSample(id) {
    db.collection("samples").doc(id).delete().then(() => {
        alert("Sample verwijderd!");
        loadSamples();
    }).catch(error => {
        console.error("Fout bij verwijderen: ", error);
    });
}

// 🔹 Laad samples bij opstarten
window.onload = loadSamples;

console.log("Script.js is geladen!");
