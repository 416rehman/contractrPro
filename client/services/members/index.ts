import { create } from "zustand";
import { requestCreateMember, requestDeleteMember, requestMembers, requestUpdateMember } from "@/services/members/api";
import { Member } from "@/types";
import { useToastsStore } from "@/services/toast";
import { clearMemberCommentsStore } from "@/services/members/comments";

export const useMembersStore = create((set: any) => ({
  members: [] as Member[],
  setMembers: (newMembers: Member[]) => set({ members: newMembers }),
  addMember: (newMember: Member) => set((state: any) => ({ members: [...state.members, newMember] })),
  removeMember: (member: Member) => set((state: any) => ({ members: state.members.filter((c: Member) => c.id !== member.id) })),
  updateMember: (member: Member) => set((state: any) => ({ members: state.members.map((c: Member) => c.id === member.id ? member : c) })),
  lastRequestedOn: null as Date | null
}));

export const loadMembers = async (currentOrganizationId: string) => {
  if (!useMembersStore.getState().lastRequestedOn) {
    useMembersStore.getState().lastRequestedOn = new Date();
  } else {
    const now = new Date();
    const diff = now.getTime() - useMembersStore.getState().lastRequestedOn.getTime();
    // if the last request was less than 5 seconds ago, don't make another request
    if (diff < 5000) {
      return;
    }
    useMembersStore.getState().lastRequestedOn = now;
  }
  try {
    const currentMembers = useMembersStore.getState().members;
    const orgMembers = await requestMembers(currentOrganizationId);

    // if the new members are different from the current members, update the store
    if (orgMembers.length !== currentMembers.length || orgMembers.some((orgMember, i) => orgMember.id !== currentMembers[i].id)) {
      useMembersStore.getState().setMembers(orgMembers);
    }
  } catch (err) {
    console.log(err);
  }
};

export const updateMemberAndPersist = async (orgMember: Member, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      if (orgMember?.id) {
        await requestUpdateMember(orgMember, currentOrganizationId);
        useMembersStore.getState().updateMember(orgMember);
        useToastsStore.getState().addToast({ id: orgMember.id, type: "success", message: "Member updated" });
        return orgMember;
      } else {
        const newMember = await requestCreateMember(orgMember, currentOrganizationId);
        useMembersStore.getState().addMember(newMember);
        useToastsStore.getState().addToast({ id: "update-orgMember", type: "success", message: "Member created" });
        return newMember;
      }
    }

  } catch (err) {
    useToastsStore.getState().addToast({ id: "update-orgMember-error", type: "error", message: err?.message || err });
  }
};

export const deleteMemberAndPersist = async (orgMember: Member, currentOrganizationId: string) => {
  try {
    if (currentOrganizationId) {
      console.log(await requestDeleteMember(orgMember, currentOrganizationId));
    }
    useMembersStore.getState().removeMember(orgMember);
    useToastsStore.getState().addToast({ id: "delete-orgMember", type: "success", message: "Member deleted" });

  } catch (err) {
    useToastsStore.getState().addToast({ id: "delete-orgMember-error", type: "error", message: err?.message || err });
  }
};

export const clearMembersStore = () => {
  useMembersStore.getState().setMembers([]);
  useMembersStore.getState().lastRequestedOn = null;
  clearMemberCommentsStore();
};