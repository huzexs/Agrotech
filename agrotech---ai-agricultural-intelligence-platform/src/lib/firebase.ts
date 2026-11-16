import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged, 
  type User 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Authentication singleton
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore singleton with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

export { 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
};

export type { User };
