// src/lib/firebase.ts
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAd1BF-8w85SzPPmDVF1Ri0LLirFxDxdMI",
  authDomain: "deraaherm.firebaseapp.com",
  projectId: "deraaherm",
  storageBucket: "deraaherm.firebasestorage.app",
  messagingSenderId: "325096883647",
  appId: "1:325096883647:web:5105f97e1f20f9fff3cd0a",
};

const app = initializeApp(firebaseConfig);

export { app };
export default app;
