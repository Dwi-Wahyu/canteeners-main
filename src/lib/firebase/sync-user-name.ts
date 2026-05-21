import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Update profil customer (nama & avatar) di seluruh Firestore chat docs
 * yang masih menyimpan data lama.
 *
 * @param userId - ID user (sama antara Prisma dan Firestore)
 * @param newName - Nama baru
 * @param newAvatar - Avatar baru (opsional)
 */
export async function syncUserNameInFirestore(
  userId: string,
  newName: string,
  newAvatar?: string,
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
    const updateData: any = {
      [`participantsInfo.${userId}.name`]: newName,
      lastUpdatedAt: FieldValue.serverTimestamp(),
    };

    if (newAvatar) {
      updateData[`participantsInfo.${userId}.avatar`] = newAvatar;
    }

    batch.update(doc.ref, updateData);
  });

  await batch.commit();
}
