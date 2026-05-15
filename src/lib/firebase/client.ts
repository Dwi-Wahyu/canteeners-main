import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { 
  initializeFirestore, 
  Firestore, 
  memoryLocalCache 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

const globalForFirebase = globalThis as unknown as {
  app: FirebaseApp | undefined;
  db: Firestore | undefined;
  auth: Auth | undefined;
};

const app = globalForFirebase.app ?? (getApps().length ? getApp() : initializeApp(firebaseConfig));

// Konfigurasi Firestore yang paling stabil untuk lingkungan Development HMR
const db = globalForFirebase.db ?? initializeFirestore(app, {
  // 1. Paksa cache di memori saja. Assertion ca9 sering terjadi karena IndexedDB yang korup.
  localCache: memoryLocalCache(),
  // 2. Gunakan Long Polling untuk menghindari ketidakstabilan WebSocket saat modul reload cepat.
  experimentalForceLongPolling: true,
});

const auth = globalForFirebase.auth ?? getAuth(app);

if (process.env.NODE_ENV !== "production") {
  globalForFirebase.app = app;
  globalForFirebase.db = db;
  globalForFirebase.auth = auth;
}

export { db, auth };
