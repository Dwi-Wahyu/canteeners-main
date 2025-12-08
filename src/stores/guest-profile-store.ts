import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";

type GuestProfileStoreActions = {
  initializeGuestProfile: ({
    cartId,
    userId,
    firebaseUid,
  }: {
    cartId: string;
    userId: string;
    customerId: string;
    firebaseUid: string;
  }) => void;

  setCustomerData: ({
    name,
    avatar,
  }: {
    name: string;
    avatar?: string;
  }) => void;
};

type GuestProfileStore = {
  cartId: string;
  userId: string;
  customerId: string;
  firebaseUid: string;

  name: string;
  avatar?: string;

  actions: GuestProfileStoreActions;
};

export const useGuestProfileStore = create<GuestProfileStore>()(
  devtools(
    persist(
      (set, get) => ({
        cartId: "",
        userId: "",
        customerId: "",
        firebaseUid: "",
        name: "",
        avatar: "",
        actions: {
          initializeGuestProfile({ cartId, userId, customerId }) {
            set({ cartId, userId, customerId });
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
