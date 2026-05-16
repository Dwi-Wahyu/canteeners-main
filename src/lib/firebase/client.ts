"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
  initializeFirestore,
  Firestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
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

// Pola Singleton menggunakan globalThis untuk mencegah inisialisasi ulang saat Next.js HMR/Reload
const globalForFirebase = globalThis as unknown as {
  app: FirebaseApp | undefined;
  db: Firestore | undefined;
  auth: Auth | undefined;
};

// 1. Inisialisasi Firebase App
const app =
  globalForFirebase.app ??
  (getApps().length ? getApp() : initializeApp(firebaseConfig));

// Cek lingkungan local development
const isDev = process.env.NODE_ENV !== "production";

// 2. Inisialisasi Firestore dengan konfigurasi adaptif
const db =
  globalForFirebase.db ??
  initializeFirestore(app, {
    /**
     * Pengaturan Cache Lokal:
     * - Development: Menggunakan Memory Cache untuk menghindari IndexedDB corrupt akibat Hot Reload (Turbopack).
     * - Production: Menggunakan Persistent Cache agar data bisa diakses offline dan hemat kuota load data.
     */
    localCache: isDev
      ? memoryLocalCache()
      : persistentLocalCache({
          tabManager: persistentMultipleTabManager(), // Mendukung sinkronisasi antar tab browser di prod
        }),

    /**
     * Pengaturan Koneksi:
     * - Development: Paksa Long Polling (HTTP) karena WebSocket sering membuat koneksi gantung (zombie) saat HMR.
     * - Production: Menggunakan WebSocket bawaan (false) untuk performa real-time paling instan.
     */
    experimentalForceLongPolling: isDev,
  });

// 3. Inisialisasi Firebase Auth
const auth = globalForFirebase.auth ?? getAuth(app);

// Simpan instance ke globalThis hanya saat di lingkungan development
if (isDev) {
  globalForFirebase.app = app;
  globalForFirebase.db = db;
  globalForFirebase.auth = auth;
}

export { db, auth };
