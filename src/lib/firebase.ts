// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged ,createUserWithEmailAndPassword,signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore ,doc, setDoc, addDoc, getDoc, writeBatch, collection, orderBy, onSnapshot, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB-TxKbw3OgJiM7AaCuhF3S3jc7eD8yYzA",
    authDomain: "moviehub-25b57.firebaseapp.com",
    projectId: "moviehub-25b57",
    storageBucket: "moviehub-25b57.firebasestorage.app",
    messagingSenderId: "485341819524",
    appId: "1:485341819524:web:5481b8df1da67a903388d1",
    measurementId: "G-GCXQJ2Y9EB"
  };

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
const auth = getAuth(app); // Authentification Firebase
const db = getFirestore(app); // Firestore pour la base de données
const storage = getStorage(app); // Firebase Storage pour le stockage de fichiers

// Export services and methods for use in other parts of the application
export { 
  auth, 
  db, 
  storage, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  writeBatch, 
  doc, 
  getAuth, 
  signOut, 
  orderBy, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  ref, 
  uploadBytes, 
  getDownloadURL 
};



