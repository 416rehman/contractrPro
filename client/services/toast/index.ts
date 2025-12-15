import { create } from "zustand";
import { Toast } from "@/components/toast";

interface ToastState {
  toasts: Toast[] | null;
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

export const useToastsStore = create<ToastState>((set) => ({
  toasts: [] as Toast[] | null,
  addToast: (toast: Toast) => set((state) => {
    const toasts = state.toasts;
    if (!toasts) {
      return { toasts: [toast] };
    }
    // remove any existing toasts with the same id
    const newToasts = toasts.filter((t) => t.id !== toast.id);
    newToasts.push(toast);
    return { toasts: newToasts };
  }),
  removeToast: (id: string) => set((state) => ({ toasts: state.toasts ? state.toasts.filter((t) => t.id !== id) : [] })),
  removeAllToasts: () => set({ toasts: [] })
}));