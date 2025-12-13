// --- CORRECTED Contents of js/firebase.js ---

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAxCpcCNp8o5MGwV6S3nMH7rI9f2gO2V7I",
    authDomain: "streakforge-01.firebaseapp.com",
    projectId: "streakforge-01",
    storageBucket: "streakforge-01.firebasestorage.app",
    messagingSenderId: "126111347012",
    appId: "1:126111347012:web:2189aa07b7ac767da8a711",
    measurementId: "G-65MHCLYPNE"
};

// 1. Initialize Firebase App (using the v8-style global 'firebase' object)
firebase.initializeApp(firebaseConfig);

// 2. Define the global 'auth' and 'db' variables that js/auth.js is looking for
const auth = firebase.auth();
const db = firebase.firestore();

// Note: You can remove the 'analytics' part as it's not needed for login/signup
// and would require its own import from the modular syntax.

// --- END of CORRECTED js/firebase.js ---