import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtk3nosFwnVVhJVHQuAKzJaDScd3LgJUw",
  authDomain: "taskmaster-app-102f3.firebaseapp.com",
  projectId: "taskmaster-app-102f3",
  storageBucket: "taskmaster-app-102f3.firebasestorage.app",
  messagingSenderId: "300376681014",
  appId: "1:300376681014:web:bc5bbcd0b65b7c61a7c697",
  measurementId: "G-B9VQBR3PDV"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Export auth và db để App.jsx có thể sử dụng
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;