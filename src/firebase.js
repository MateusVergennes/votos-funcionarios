// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATSEtYozTgTE8074sOfGqDegNrdp1lN9A",
  authDomain: "votacao-projetos.firebaseapp.com",
  projectId: "votacao-projetos",
  storageBucket: "votacao-projetos.appspot.com",
  messagingSenderId: "674340501167",
  appId: "1:674340501167:web:3c12c4f3649add72c1065a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)