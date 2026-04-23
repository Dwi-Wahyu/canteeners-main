import { create } from "zustand";

interface CartAnimationStore {
  isShaking: boolean;
  triggerShake: () => void;
}

export const useCartAnimationStore = create<CartAnimationStore>((set) => ({
  isShaking: false,
  triggerShake: () => {
    set({ isShaking: true });
    setTimeout(() => set({ isShaking: false }), 500);
  },
}));
