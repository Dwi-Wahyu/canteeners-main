import { useGuestProfileStore } from "@/stores/guest-profile-store";

export const useGuestCartId = () =>
  useGuestProfileStore((state) => state.cart_id);

export const useGuestUserId = () =>
  useGuestProfileStore((state) => state.user_id);

export const useGuestCustomerId = () =>
  useGuestProfileStore((state) => state.customer_id);

export const useGuestName = () => useGuestProfileStore((state) => state.name);

export const useInitializeGuestProfile = () =>
  useGuestProfileStore((state) => state.actions.initializeGuestProfile);

export const useSetCustomerData = () =>
  useGuestProfileStore((state) => state.actions.setCustomerData);
