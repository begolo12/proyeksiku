// app/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDeRUMmuTcTo1320Xvq1Zkk6MHv9_3wGUQ",
    authDomain: "nobar-c092c.firebaseapp.com",
    databaseURL: "https://nobar-c092c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nobar-c092c",
    storageBucket: "nobar-c092c.firebasestorage.app",
    messagingSenderId: "377683170284",
    appId: "1:377683170284:web:e087ba49e4c4495a51a6c9",
    measurementId: "G-849NZ7HHNV"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
