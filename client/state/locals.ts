import { create } from "zustand";

export const useLocalsStore = create((set: any) => ({
  currentOrganization: JSON.parse(localStorage?.getItem("currentOrganization") || "null") || null,
  setCurrentOrganization: (selectedOrganization: any | null) => {
    set((state) => state.currentOrganization = selectedOrganization || null);
    localStorage.setItem("currentOrganization", JSON.stringify(selectedOrganization || null));
  }
}));