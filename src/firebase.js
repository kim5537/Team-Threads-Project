import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIS62fGhIygp-74HK95OBsVyW3aoD-yEU",
  authDomain: "snsflatform-241009.firebaseapp.com",
  projectId: "snsflatform-241009",
  storageBucket: "snsflatform-241009.appspot.com",
  messagingSenderId: "207260495385",
  appId: "1:207260495385:web:585b5678f94800ebc68488",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
