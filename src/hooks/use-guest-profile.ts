import { useGuestProfileStore } from "@/stores/guest-profile-store";

export const useGuestCartId = () =>
  useGuestProfileStore((state) => state.cartId);

export const useGuestUserId = () =>
  useGuestProfileStore((state) => state.userId);

export const useGuestCustomerId = () =>
  useGuestProfileStore((state) => state.customerId);

export const useGuestName = () => useGuestProfileStore((state) => state.name);

export const useInitializeGuestProfile = () =>
  useGuestProfileStore((state) => state.actions.initializeGuestProfile);

export const useSetCustomerData = () =>
  useGuestProfileStore((state) => state.actions.setCustomerData);
