import { getApps, initializeApp, cert, getApp, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getMessaging, Messaging } from "firebase-admin/messaging";

// Lazy initialization — tidak dieksekusi saat build
function getAdminApp(): App {
  if (getApps().length > 0) return getApp();

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  // Saat build, env tidak tersedia — lempar error yang jelas
  // tapi tidak akan sampai ke sini karena dipanggil lazy
  if (!privateKey || !clientEmail || !projectId) {
    throw new Error("Firebase Admin env vars tidak tersedia");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

// Getter functions — hanya dieksekusi saat dipanggil (runtime)
export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminMessaging(): Messaging {
  return getMessaging(getAdminApp());
}

// Backward compatible — lazy proxy
export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    return getAuth(getAdminApp())[prop as keyof Auth];
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    return getFirestore(getAdminApp())[prop as keyof Firestore];
  },
});

export const adminMessaging = new Proxy({} as Messaging, {
  get(_, prop) {
    return getMessaging(getAdminApp())[prop as keyof Messaging];
  },
});
