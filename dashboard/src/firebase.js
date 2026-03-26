import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDO73DHZmUJ1j4t59DLiWz7ZwQ7DZiJ0To",
  authDomain: "airescuebuoy.firebaseapp.com",
  projectId: "airescuebuoy",
  storageBucket: "airescuebuoy.firebasestorage.app",
  messagingSenderId: "234383151670",
  appId: "1:234383151670:web:acd668fd78259facaf7e97"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);