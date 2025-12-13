// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxCpcCNp8o5MGwV6S3nMH7rI9f2gO2V7I",
  authDomain: "streakforge-01.firebaseapp.com",
  projectId: "streakforge-01",
  storageBucket: "streakforge-01.firebasestorage.app",
  messagingSenderId: "126111347012",
  appId: "1:126111347012:web:2189aa07b7ac767da8a711",
  measurementId: "G-65MHCLYPNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);