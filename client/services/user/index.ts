import { create } from "zustand";
import { Organization, tUser } from "@/types";
import { requestUserOrganizations } from "@/services/user/api";

export const useUserStore = create((set: any) => ({
  user: null as tUser | null,
  setUser: (user: tUser | null) => set({ user }),
  organizations: [] as Organization[],
  setOrganizations: (organizations: Organization[]) => set({ organizations }),
  currentOrganization: null as Organization | null,
  setCurrentOrganization: (organization: Organization | null) => {
    set({ currentOrganization: organization });
  }
}));

export const loadUserOrganizations = async () => {
  try {
    useUserStore.getState().setOrganizations(await requestUserOrganizations());
  } catch (err) {
    console.log(err);
  }
};