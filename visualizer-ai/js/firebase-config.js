// Firebase Configuration
// REPLACE THESE VALUES WITH YOUR ACTUAL FIREBASE PROJECT CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyCF1pCoSQ_Nf8ptzcIRIrVxppdBPMhWqxQ",
    authDomain: "viz-ai.firebaseapp.com",
    projectId: "viz-ai",
    storageBucket: "viz-ai.firebasestorage.app",
    messagingSenderId: "927893099654",
    appId: "1:927893099654:web:533e5889bdf56bb59fed07",
    measurementId: "G-33TEQKCETY"
};

// Initialize Firebase
// Note: We need to ensure the Firebase SDK is loaded in index.html before this runs
let db;

function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.warn("Firebase SDK not loaded. Falling back to local data.");
        return false;
    }

    try {
        if (!firebase.apps.length) {
            const app = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();

            // Enable Offline Persistence
            db.enablePersistence()
                .catch((err) => {
                    if (err.code == 'failed-precondition') {
                        console.warn("Firebase persistence failed: Multiple tabs open.");
                    } else if (err.code == 'unimplemented') {
                        console.warn("Firebase persistence not supported by browser.");
                    }
                });
            console.log("✅ Firebase initialized with offline persistence.");
        } else {
            db = firebase.firestore();
            console.log("ℹ️ Firebase already initialized.");
        }
        return true;
    } catch (e) {
        console.error("❌ Firebase initialization error:", e);
        return false;
    }
}

// Export for use in app.js
window.initFirebase = initFirebase;
window.getDb = () => db;
