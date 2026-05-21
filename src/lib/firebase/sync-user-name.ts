import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Update nama customer di seluruh Firestore chat docs
 * yang masih menyimpan nama guest lama.
 *
 * Dipanggil setelah guest berhasil di-convert ke user terdaftar.
 *
 * @param userId - ID user (sama antara Prisma dan Firestore)
 * @param newName - Nama baru dari Google account
 */
export async function syncUserNameInFirestore(
  userId: string,
  newName: string,
): Promise<void> {
  const db = adminDb;

  // Query semua chat docs yang melibatkan userId ini
  const snapshot = await db
    .collection("chats")
    .where("participantIds", "array-contains", userId)
    .get();

  if (snapshot.empty) return;

  const batch = db.batch();

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      [`participantsInfo.${userId}.name`]: newName,
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
}
