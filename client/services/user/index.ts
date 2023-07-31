import { create } from "zustand";
import { Organization, tUser } from "@/types";
import { requestCreateOrganization, requestUserOrganizations } from "@/services/user/api";
import { clearInvoicesStore } from "@/services/invoices";
import { clearExpensesStore } from "@/services/expenses";
import { clearMembersStore } from "@/services/members";
import { clearClientsStore } from "@/services/clients";
import { clearContractsStore } from "@/services/contracts";
import { clearVendorStore } from "@/services/vendors";
import { setLocalStorageItem } from "@/utils/safeLocalStorage";

export const useUserStore = create((set: any) => ({
  user: null as tUser | null,
  setUser: (user: tUser | null) => set({ user }),
  organizations: [] as Organization[],
  setOrganizations: (organizations: Organization[]) => set({ organizations }),
  currentOrganization: null as Organization | null,
  setCurrentOrganization: (organization: Organization | null) => {
    set({ currentOrganization: organization });
  },
  lastRequestedOn: null as Date | null
}));

export const loadUserOrganizations = async () => {
  if (!useUserStore.getState().lastRequestedOn) {
    useUserStore.getState().lastRequestedOn = new Date();
  } else {
    const now = new Date();
    const diff = now.getTime() - useUserStore.getState().lastRequestedOn.getTime();
    // if the last request was less than 5 seconds ago, don't make another request
    if (diff < 5000) {
      return;
    }
    useUserStore.getState().lastRequestedOn = now;
  }
  try {
    const currentOrgs = useUserStore.getState().organizations;
    const orgs = await requestUserOrganizations();

    // if the new orgs are different from the current orgs, update the store
    if (orgs.length !== currentOrgs.length || orgs.some((org, i) => org.id !== currentOrgs[i].id)) {
      useUserStore.getState().setOrganizations(orgs);
      const currentCachedOrg = JSON.parse(localStorage.getItem("currentOrganization") || "null");
      if (currentCachedOrg) {
        const currentOrg = orgs.find((org) => org.id === currentCachedOrg.id);
        if (currentOrg) {
          useUserStore.getState().setCurrentOrganization(currentOrg);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const setCurrentOrganization = (organization: Organization | null) => {
  // if the new org is different from the current org, updates the store and clears all the current org's data
  if (organization?.id !== useUserStore.getState().currentOrganization?.id) {
    useUserStore.getState().setCurrentOrganization(organization);
    setLocalStorageItem("currentOrganization", JSON.stringify(organization));

    // Clear all the current org's data
    clearClientsStore();
    clearContractsStore();
    clearExpensesStore();
    clearMembersStore();
    clearInvoicesStore();
    clearVendorStore();
  }
};

export const createOrganization = async (organization: Organization) => {
  try {
    const createdOrg = await requestCreateOrganization(organization);

    console.log("createdOrg", createdOrg);

    if (createdOrg) {
      useUserStore.getState().setOrganizations([...useUserStore.getState().organizations, createdOrg]);
    }

    return createdOrg;
  } catch (err) {
    console.log(err);
  }
};

export const clearUserStore = () => {
  useUserStore.getState().setUser([]);
  useUserStore.getState().setOrganizations([]);
  useUserStore.getState().lastRequestedOn = null;
};