import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, increment, onSnapshot } from "firebase/firestore";

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

export { app, auth, db, provider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, doc, setDoc, getDoc, updateDoc, arrayUnion, increment, onSnapshot };
