import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA3vMYUk3NTC6tJAueagEcLXFvHvd-kdkE",
  authDomain: "clickinc-1fb7a.firebaseapp.com",
  projectId: "clickinc-1fb7a",
  storageBucket: "clickinc-1fb7a.firebasestorage.app",
  messagingSenderId: "348685551976",
  appId: "1:348685551976:web:310122ce1de5d3b36aeedd",
  measurementId: "G-1RSH7Q0D7W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Storage with longer timeouts
const storageInstance = getStorage(app);
storageInstance.maxUploadRetryTime = 120000; // 2 minutes
storageInstance.maxOperationRetryTime = 120000; // 2 minutes