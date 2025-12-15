import { createGuestCustomer } from "@/features/user/lib/user-actions";
import { getCustomerById } from "@/features/user/lib/user-queries";
import { getAuth, signInAnonymously } from "firebase/auth";
import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";

type CartStoreActions = {
  initializeCart: ({
    name,
    isGuest,
    customerId,
  }: {
    name: string;
    isGuest: boolean;
    customerId?: string;
  }) => Promise<{ firebaseUid: string }>;

  setCustomerData: ({
    name,
    avatar,
  }: {
    name: string;
    avatar?: string;
  }) => void;
};

type CartStore = {
  cartId: string;
  userId: string;
  customerId: string;

  name: string;
  avatar?: string;

  actions: CartStoreActions;
};

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        cartId: "",
        userId: "",
        customerId: "",
        firebaseToken: "",
        firebaseUid: "",
        name: "",
        avatar: "",
        actions: {
          async initializeCart({ name, isGuest, customerId }) {
            if (isGuest) {
              const auth = getAuth();

              const result = await signInAnonymously(auth);

              const createGuest = await createGuestCustomer({
                firebaseUserUid: result.user.uid,
                guestName: name,
              });

              if (createGuest.success && createGuest.data) {
                set({
                  cartId: createGuest.data.cart_id,
                  userId: createGuest.data.user_id,
                  customerId: createGuest.data.customer_id,
                  name,
                });
              } else {
                throw new Error("Gagal membuat guest customer");
              }

              return { firebaseUid: result.user.uid };
            }

            if (!customerId) {
              throw new Error(
                "Masukkan customerId untuk customer terautentikasi"
              );
            }

            const customer = await getCustomerById({ customerId });

            if (!customer) {
              throw new Error("Customer tidak ditemukan");
            }

            set({
              cartId: customer.cart?.id,
              userId: customer.user_id,
              name: customer.user.name,
              avatar: customer.user.avatar,
            });

            return { firebaseUid: customer.user.id };
          },
          setCustomerData({ name, avatar }) {
            set({ name, avatar });
          },
        },
      }),
      {
        name: "guest-profile-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
