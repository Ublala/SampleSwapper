// 🔹 Firebase Config (Vervang met jouw Firebase gegevens)
const firebaseConfig = {
    apiKey: "AIzaSyAhKPrwi66YsMtxnpeINOfVT0LC67KG5tw",
    authDomain: "sampleswapper.firebaseapp.com",
    projectId: "sampleswapper",
    storageBucket: "sampleswapper.firebasestorage.app",
    messagingSenderId: "30622034305",
    appId: "1:30622034305:web:c11d34889c902304e3e080"
};

// 🔹 Firebase Initialiseren
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🔹 Sample Toevoegen aan Database
function addSample() {
    let name = document.getElementById("whiskyName").value;
    let age = document.getElementById("whiskyAge").value;
    let type = document.getElementById("whiskyType").value;
    let value = document.getElementById("whiskyValue").value;

    if(name === "" || age === "" || type === "" || value === "") {alert("Vul alle velden in!");
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
        loadSamples(); // Herlaad de lijst
    }).catch(error => {
        console.error("Fout bij toevoegen: ", error);
});
}

// 🔹 Samples Ophalen uit Database
function loadSamples() {
    document.getElementById("sampleList").innerHTML = "";

    db.collection("samples").orderBy("timestamp", "desc").get().then(snapshot => {
        snapshot.forEach(doc => {
            let sample = doc.data();
            document.getElementById("sampleList").innerHTML += `
                <div>
                    <h3>${sample.name} (${sample.age})</h3>
                    <p>Type: ${sample.type}</p>
                    <p>Waarde: ${sample.value}</p>
                    <hr>
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

// 🔹 Laad samples bij start
window.onload = loadSamples;
