import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdtmTuNHTQnP5TKkIfJVntqEAbJOYxE_k",
  authDomain: "intellimock-17df8.firebaseapp.com",
  projectId: "intellimock-17df8",
  storageBucket: "intellimock-17df8.firebasestorage.app",
  messagingSenderId: "183479266501",
  appId: "1:183479266501:web:a50b7999eff9ebf53c54ac"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, doc, setDoc, getDoc, updateDoc, arrayUnion, increment, onSnapshot };
