import { useCartStore } from "../lib/cart-store";

export const useCartId = () => useCartStore((state) => state.cartId);

export const useInitializeCart = () =>
  useCartStore((state) => state.actions.initializeCart);
