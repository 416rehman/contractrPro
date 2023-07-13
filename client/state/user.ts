import { create } from "zustand";
import { tUser } from "@/types/types";

export const useUserStore = create((set: any) => ({
  user: null as tUser | null,
  setUser: (user: tUser | null) => set({ user })
}));