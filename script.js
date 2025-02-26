// 🔹 Wacht tot Firebase is geladen voordat we `auth` en `db` gebruiken
document.addEventListener("DOMContentLoaded", function () {
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

    // 🔹 Firebase Services Initialiseren
    const auth = firebase.auth();
    const db = firebase.firestore();

    // 🔹 Debug: Controleer of Firebase correct is geladen
    console.log("✅ Firebase is geladen:", firebase);
    console.log("✅ Firestore Database:", db);
    console.log("✅ Firebase Authentication:", auth);

    // 🔹 Gebruiker Registreren
    window.register = function () {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                alert("✅ Registratie succesvol! Je bent ingelogd.");
                checkUser();
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



    // 🔹 Controleer of een gebruiker ingelogd is
    function checkUser() {
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
}

    // 🔹 Controleer automatisch bij opstarten of gebruiker ingelogd is
    checkUser();
});
    
    // 🔹 Uitloggen

window.logout = function () {
    auth.signOut().then(() => {
        alert("✅ Uitgelogd!");
        checkUser();
    }).catch(error => {
        console.error("❌ Fout bij uitloggen:", error);
    });
};

// 🔹 Sample Toevoegen aan Database
function addSample() {
    let name = document.getElementById("whiskyName").value;
    let age = document.getElementById("whiskyAge").value;
    let type = document.getElementById("whiskyType").value;
    let value = document.getElementById("whiskyValue").value;

    if (name === "" || age === "" || type === "" || value === "") {
        alert("⚠️ Vul alle velden in!");
        return;
    }

    db.collection("samples").add({
        name: name,
        age: age,
        type: type,
        value: value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("✅ Sample toegevoegd!");
        loadSamples(); // Samples herladen
    }).catch(error => {
        console.error("❌ Fout bij toevoegen: ", error);
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
        alert("✅ Sample verwijderd!");
        loadSamples();
    }).catch(error => {
        console.error("❌ Fout bij verwijderen: ", error);
    });
}

    // 🔹 Gebruiker Uitloggen
    window.logout = function () {
        auth.signOut().then(() => {
            alert("✅ Uitgelogd!");
            checkUser();
        });
    };

// 🔹 Maak de functies beschikbaar voor HTML-knoppen
window.register = register;
window.login = login;
window.logout = logout;

// 🔹 Laad samples bij opstarten
window.onload = () => {
    loadSamples();
    checkUser();
};
