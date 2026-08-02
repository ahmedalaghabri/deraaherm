// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAd1BF-8w85SzPPmDVF1Ri0LLirFxDxdMI",
  authDomain: "deraaherm.firebaseapp.com",
  projectId: "deraaherm",
  storageBucket: "deraaherm.firebasestorage.app",
  messagingSenderId: "325096883647",
  appId: "1:325096883647:web:5105f97e1f20f9fff3cd0a",
};

const app = initializeApp(firebaseConfig);

// Firestore مع تخزين محلي دائم (يعمل دون اتصال ويُزامن تلقائياً عند عودة الشبكة)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

// Cloud Functions (نفس منطقة askAssistant)
const functions = getFunctions(app, "europe-west1");

export { app, db, functions };
export default app;
