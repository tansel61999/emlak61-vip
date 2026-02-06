import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCy7Mm87zPRixiPr61MqN733JOeFbY3o8o",
  authDomain: "emlak-ffb6e.firebaseapp.com",
  projectId: "emlak-ffb6e",
  storageBucket: "emlak-ffb6e.firebasestorage.app",
  messagingSenderId: "828609472864",
  appId: "1:828609472864:android:7f4c09d0f093c190e85605"
};

const uygulama = initializeApp(firebaseConfig);

export const veritabani = getFirestore(uygulama);
export const yetki = getAuth(uygulama);
export const depolama = getStorage(uygulama);
export const saglayici = new GoogleAuthProvider();

export default uygulama;