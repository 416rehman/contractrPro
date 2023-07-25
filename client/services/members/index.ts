import { create } from "zustand";
import {
    requestCreateOrgMember,
    requestDeleteOrgMember,
    requestOrganizationOrgMembers,
    requestUpdateOrgMember
} from "@/services/members/api";
import { OrgMember } from "@/types";
import { useToastsStore } from "@/services/toast";

export const useOrgMembersStore = create((set: any) => ({
  orgMembers: [] as OrgMember[],
  setOrgMembers: (orgMembers: OrgMember[]) => set({ orgMembers }),
  addOrgMember: (orgMember: OrgMember) => set((state: any) => ({ orgMembers: [...state.orgMembers, orgMember] })),
  removeOrgMember: (orgMember: OrgMember) => set((state: any) => ({ orgMembers: state.orgMembers.filter((c: OrgMember) => c.id !== orgMember.id) })),
  updateOrgMember: (orgMember: OrgMember) => set((state: any) => ({ orgMembers: state.orgMembers.map((c: OrgMember) => c.id === orgMember.id ? orgMember : c) }))
}));

export const loadOrgMembers = async (currentOrganizationId: string) => {
  try {
    const currentOrgMembers = useOrgMembersStore.getState().orgMembers;
    const orgOrgMembers = await requestOrganizationOrgMembers(currentOrganizationId);

    // if the new orgMembers are different from the current orgMembers, update the store
    if (orgOrgMembers.length !== currentOrgMembers.length || orgOrgMembers.some((orgMember, i) => orgMember.id !== currentOrgMembers[i].id)) {
      useOrgMembersStore.getState().setOrgMembers(orgOrgMembers);
    }
  } catch (err) {
    console.log(err);
  }
};

export const updateOrgMember = async (orgMember: OrgMember, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      if (orgMember?.id) {
        await requestUpdateOrgMember(orgMember, currentOrganizationId);
        useOrgMembersStore.getState().updateOrgMember(orgMember);
        useToastsStore.getState().addToast({ id: orgMember.id, type: "success", message: "OrgMember updated" });
      } else {
        const newOrgMember = await requestCreateOrgMember(orgMember, currentOrganizationId);
        useOrgMembersStore.getState().addOrgMember(newOrgMember);
        useToastsStore.getState().addToast({ id: "update-orgMember", type: "success", message: "OrgMember created" });
      }
    }

  } catch (err) {
    useToastsStore.getState().addToast({ id: "update-orgMember-error", type: "error", message: err?.message || err });
  }
};

export const deleteOrgMember = async (orgMember: OrgMember, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      console.log(await requestDeleteOrgMember(orgMember, currentOrganizationId));
    }
    useOrgMembersStore.getState().removeOrgMember(orgMember);
    useToastsStore.getState().addToast({ id: "delete-orgMember", type: "success", message: "OrgMember deleted" });

  } catch (err) {
    useToastsStore.getState().addToast({ id: "delete-orgMember-error", type: "error", message: err?.message || err });
  }
};