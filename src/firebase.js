import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGa6DvwiQM2l9vtk3147rOvm4jnHLm_ig",
  authDomain: "thread-team.firebaseapp.com",
  projectId: "thread-team",
  storageBucket: "thread-team.firebasestorage.app",
  messagingSenderId: "506336628483",
  appId: "1:506336628483:web:673e4dcb2daa0c4e292336",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
