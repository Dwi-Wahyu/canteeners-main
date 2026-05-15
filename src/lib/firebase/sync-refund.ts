// src/lib/firebase/sync-refund.ts
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface RefundFirestoreData {
  refundId: string;
  orderId: string;
  shopOwnerUserId: string;
  customerUserId: string;
  status: string;
  amount: number;
  reason: string;
  disbursementMode: string;
  requestedAt: Date;
}

/**
 * Tulis / update dokumen refund di Firestore.
 * Dipanggil setiap kali ada perubahan status refund di PostgreSQL.
 * Ini adalah "realtime trigger" — bukan sumber data utama.
 */
export async function syncRefundToFirestore(
  refundId: string,
  data: Partial<RefundFirestoreData> & { status: string },
): Promise<void> {
  const refundRef = adminDb.collection("refunds").doc(refundId);
  await refundRef.set(
    {
      ...data,
      lastUpdatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }, // merge: tidak menghapus field lain yang sudah ada
  );
}
