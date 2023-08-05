import { create } from "zustand";
import { Organization, OrganizationSummary, tUser } from "@/types";

import {
  getOrganizationSummary,
  requestAvatarChange,
  requestCreateOrganization,
  requestDeleteOrganization,
  requestEmailChange,
  requestNameChange,
  requestPhoneChange,
  requestUpdateOrganization,
  requestUserWithOrganizations
} from "@/services/user/api";

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
  currentOrganization: null as Organization | null,
  setCurrentOrganization: (organization: Organization | null) => {
    set({ currentOrganization: organization });
  },
  currentOrganizationSummary: null as OrganizationSummary | null,
  setCurrentOrganizationSummary: (summary: OrganizationSummary | null) => {
    set({ currentOrganizationSummary: summary });
  },
  lastRequestedOn: null as Date | null
}));

export const loadUserWithOrganizations = async () => {
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
    const userData = await requestUserWithOrganizations();
    useUserStore.getState().setUser(userData);

    const currentCachedOrg = JSON.parse(localStorage.getItem("currentOrganization") || "null");
    if (currentCachedOrg) {
      const currentOrg = userData.Organizations.find((org: Organization) => org.id === currentCachedOrg.id);
      if (currentOrg) {
        setCurrentOrganization(currentOrg);
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

    if (organization?.id) {
      getOrganizationSummary(organization?.id).then((summary) => {
        useUserStore.getState().setCurrentOrganizationSummary(summary);
      });
    } else {
      useUserStore.getState().setCurrentOrganizationSummary(null);
    }
  }
};

export const updateOrganizationAndPersist = async (organization: Organization) => {
  try {
    if (organization?.id) {
      const updatedOrg = await requestUpdateOrganization(organization);
      useUserStore.getState().setUser({
        ...useUserStore.getState().user,
        Organizations: useUserStore.getState().user?.Organizations.map((org) => {
          if (org.id === organization.id) {
            return updatedOrg;
          }
          return org;
        })
      });
      return updatedOrg;
    }

    const createdOrg = await requestCreateOrganization(organization);
    if (createdOrg) {
      useUserStore.getState().setUser({
        ...useUserStore.getState().user,
        Organizations: [...useUserStore.getState().user?.Organizations, createdOrg]
      });
    }
    return createdOrg;
  } catch (err) {
    console.log(err);
  }
};

export const deleteOrganizationAndPersist = async (organizationId: string) => {
  try {
    const result = requestDeleteOrganization(organizationId);
    if (result) {
      const currentOrg = useUserStore.getState().currentOrganization;

      useUserStore.getState().setUser({
        ...useUserStore.getState().user,
        Organizations: useUserStore.getState().user?.Organizations.filter((org) => org.id !== organizationId)
      });

      if (currentOrg?.id === organizationId) {
        setCurrentOrganization(null);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const changeAndPersistAvatarUrl = async (avatarUrl: string) => {
  try {
    if (avatarUrl === useUserStore.getState().user?.avatarUrl) {
      return Promise.resolve();
    }
    const user = useUserStore.getState().user;
    if (user?.id) { // if the user is logged in
      const updatedData = await requestAvatarChange(avatarUrl);
      if (updatedData) {
        useUserStore.getState().setUser({ ...user, avatarUrl });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const changeAndPersistName = async (name: string) => {
  try {
    if (name === useUserStore.getState().user?.name) {
      return Promise.resolve();
    }
    const user = useUserStore.getState().user;
    if (user?.id) { // if the user is logged in
      const updatedData = await requestNameChange(name);
      if (updatedData) {
        useUserStore.getState().setUser({ ...user, name });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const changeEmail = async (email: string) => {
  try {
    if (email === useUserStore.getState().user?.email) {
      return Promise.resolve("Email updated");
    }
    const user = useUserStore.getState().user;
    if (user?.id) { // if the user is logged in
      const response = await requestEmailChange(email);
      if (response) {
        return response;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const changePhone = async (phoneCountry: string, phoneNumber: string) => {
  try {
    if (!phoneNumber) {
      return Promise.reject("Phone number is required");
    }
    if (!phoneCountry) {
      return Promise.reject("Phone country is required");
    }

    if (phoneCountry === useUserStore.getState().user?.phoneCountry && phoneNumber === useUserStore.getState().user?.phoneNumber) {
      return Promise.resolve("Phone number updated");
    }

    const user = useUserStore.getState().user;
    if (user?.id) { // if the user is logged in
      const response = await requestPhoneChange(phoneCountry, phoneNumber);
      if (response) {
        return response;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const clearUserStore = () => {
  useUserStore.getState().setUser({});
  useUserStore.getState().lastRequestedOn = null;
  useUserStore.getState().setCurrentOrganization(null);
  useUserStore.getState().setCurrentOrganizationSummary(null);
};