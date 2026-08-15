import { createGuestCustomer } from "@/features/user/lib/user-actions";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export async function createGuestSession({
  name,
  tableData,
  guestId,
}: {
  name: string;
  tableData?: {
    canteen_id: number;
    floor: number;
    table_number: number;
  };
  guestId?: string;
}): Promise<{ cartId: string | null; userId: string | null }> {
  // Use existing guestId if available, otherwise generate random UUID locally
  const guestUid = guestId || crypto.randomUUID();

  const createGuest = await createGuestCustomer({
    firebaseUserUid: guestUid,
    guestName: name,
    tableData,
  });

  if (!createGuest.success) {
    toast.error(
      "Terjadi kesalahan saat membuat sesi tamu, akun tidak berhasil dibuat"
    );
    return { cartId: null, userId: null };
  }

  if (!createGuest.data) {
    toast.error(
      "Terjadi kesalahan saat membuat sesi tamu, data akun tidak berhasil dimuat"
    );
    return { cartId: null, userId: null };
  }

  const res = await signIn("credentials", {
    username: "",
    password: "",
    name,
    isGuest: "true",
    firebaseUid: createGuest.data.user_id,
    redirect: false,
  });

  if (res?.error) {
    toast.error("Terjadi kesalahan saat membuat sesi tamu");

    return { cartId: null, userId: null };
  } else {
    return {
      cartId: createGuest.data.cart_id,
      userId: createGuest.data.user_id,
    };
  }
}
