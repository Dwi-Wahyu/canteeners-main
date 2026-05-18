import { getApps, initializeApp, cert, getApp, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getMessaging, Messaging } from "firebase-admin/messaging";

// Instances cache
let app: App;
let auth: Auth;
let db: Firestore;
let messaging: Messaging;

// Lazy initialization — tidak dieksekusi saat build
function getAdminApp(): App {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApp();
    return app;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  // Saat build, env tidak tersedia — lempar error yang jelas
  // tapi tidak akan sampai ke sini karena dipanggil lazy
  if (!privateKey || !clientEmail || !projectId) {
    throw new Error("Firebase Admin env vars tidak tersedia");
  }

  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
  return app;
}

// Getter functions — hanya dieksekusi saat dipanggil (runtime)
export function getAdminAuth(): Auth {
  if (!auth) auth = getAuth(getAdminApp());
  return auth;
}

export function getAdminDb(): Firestore {
  if (!db) db = getFirestore(getAdminApp());
  return db;
}

export function getAdminMessaging(): Messaging {
  if (!messaging) messaging = getMessaging(getAdminApp());
  return messaging;
}

// Backward compatible — lazy proxy
export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    const instance = getAdminAuth();
    const value = instance[prop as keyof Auth];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    const instance = getAdminDb();
    const value = instance[prop as keyof Firestore];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const adminMessaging = new Proxy({} as Messaging, {
  get(_, prop) {
    const instance = getAdminMessaging();
    const value = instance[prop as keyof Messaging];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
