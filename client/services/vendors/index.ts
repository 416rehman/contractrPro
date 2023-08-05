import { create } from "zustand";
import {
  requestCreateVendor,
  requestDeleteVendor,
  requestOrganizationVendors,
  requestUpdateVendor
} from "@/services/vendors/api";
import { Vendor } from "@/types";
import { useToastsStore } from "@/services/toast";
import { clearVendorCommentsStore } from "@/services/vendors/comments";

export const useVendorsStore = create((set: any) => ({
  vendors: [] as Vendor[],
  setVendors: (vendors: Vendor[]) => set({ vendors }),
  addVendor: (vendor: Vendor) => set((state: any) => ({ vendors: [...state.vendors, vendor] })),
  removeVendor: (vendor: Vendor) => set((state: any) => ({ vendors: state.vendors.filter((c: Vendor) => c.id !== vendor.id) })),
  updateVendor: (vendor: Vendor) => set((state: any) => ({ vendors: state.vendors.map((c: Vendor) => c.id === vendor.id ? vendor : c) })),
  lastRequestedOn: null as Date | null
}));

export const loadVendors = async (OrganizationId: string) => {
  if (!useVendorsStore.getState().lastRequestedOn) {
    useVendorsStore.getState().lastRequestedOn = new Date();
  } else {
    const now = new Date();
    const diff = now.getTime() - useVendorsStore.getState().lastRequestedOn.getTime();
    // if the last request was less than 5 seconds ago, don't make another request
    if (diff < 5000) {
      return;
    }
    useVendorsStore.getState().lastRequestedOn = now;
  }
  try {
    const currentVendors = useVendorsStore.getState().vendors;
    const orgVendors = await requestOrganizationVendors(OrganizationId);

    // if the new vendors are different from the current vendors, update the store
    if (orgVendors.length !== currentVendors.length || orgVendors.some((vendor, i) => vendor.id !== currentVendors[i].id)) {
      useVendorsStore.getState().setVendors(orgVendors);
    }
  } catch (err) {
    console.log(err);
  }
};

export const updateVendor = async (vendor: Vendor, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      if (vendor?.id) {
        await requestUpdateVendor(vendor, currentOrganizationId);
        useVendorsStore.getState().updateVendor(vendor);
        useToastsStore.getState().addToast({ id: vendor.id, type: "success", message: "Vendor updated" });
        return vendor;
      } else {
        const newVendor = await requestCreateVendor(vendor, currentOrganizationId);
        useVendorsStore.getState().addVendor(newVendor);
        useToastsStore.getState().addToast({ id: "update-vendor", type: "success", message: "Vendor created" });
        return newVendor;
      }
    }

  } catch (err) {
    useToastsStore.getState().addToast({ id: "update-vendor-error", type: "error", message: err?.message || err });
  }
};

export const deleteVendor = async (vendor: Vendor, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      console.log(await requestDeleteVendor(vendor, currentOrganizationId));
    }
    useVendorsStore.getState().removeVendor(vendor);
    useToastsStore.getState().addToast({ id: "delete-vendor", type: "success", message: "Vendor deleted" });

  } catch (err) {
    useToastsStore.getState().addToast({ id: "delete-vendor-error", type: "error", message: err?.message || err });
  }
};

export const clearVendorStore = () => {
  useVendorsStore.getState().setVendors([]);
  useVendorsStore.getState().lastRequestedOn = null;
  clearVendorCommentsStore();
};