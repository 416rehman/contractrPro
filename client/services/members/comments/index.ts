import { create } from "zustand";
import {
  requestComments,
  requestCreateComment,
  requestDeleteAttachments,
  requestDeleteComment,
  requestUpdateComment
} from "./api";
import { Comment, Member } from "@/types";

/**
 * {"memberId":  {
 *        "comments": [{
 *                "id": "d6a7f941-5f07-4943-b005-1340ac1519b8",
 *                "content": "comment on member",
 *                "createdAt": "2023-07-28T15:37:31.323Z",
 *                "updatedAt": "2023-07-28T15:37:31.323Z",
 *                "OrganizationId": "559b0df0-621c-4d48-a58f-bf5d7dc7efed",
 *                "MemberId": "264bf6eb-819e-40ce-a418-dc5daea11752",
 *                "AuthorId": "899ed5f2-8c75-420f-a984-8dab1365a83a",
 *                "Attachments": [{
 *                        "name": "Ainput.png", "type": "image/png", "size": "1186",
 *                    }]
 *            }],
 *        "currentPage": 1,
 *        "totalPages": 1
 *    }
 * }
 */
type CommentStoreEntry = {
  comments: Comment[];
  currentPage: number;
  totalPages: number;
}

export const useMemberCommentsStore = create((set: any) => ({
  // memberComments is a key value map of memberId and an object with comments
  memberComments: {} as Record<string, CommentStoreEntry>,
  setMemberComments: (memberId: string, comments: any[]) => set((state: any) => ({
    memberComments: {
      ...state.memberComments,
      [memberId]: comments
    }
  })),

  addMemberComment: (memberId: string, comment: any) => set((state: any) => ({
    memberComments: {
      ...(state.memberComments || {}),
      [memberId]: {
        ...(state.memberComments[memberId] || {}),
        comments: [
          ...(state.memberComments[memberId]?.comments || []),
          comment
        ]
      }
    }
  })),

  removeMemberComment: (memberId: string, commentId: string) => set((state: any) => ({
    memberComments: {
      ...state.memberComments,
      [memberId]: {
        ...state.memberComments[memberId],
        comments: [
          ...state.memberComments[memberId].comments.filter((c: any) => c.id !== commentId)
        ]
      }
    }
  })),

  updateMemberComment: (memberId: string, comment: any) => set((state: any) => {
    const currentComments = state.memberComments[memberId].comments;

    return ({
      memberComments: {
        ...state.memberComments,
        [memberId]: {
          ...state.memberComments[memberId],
          comments: currentComments.map((c: any) => c.id === comment.id ? comment : c)
        }
      }
    });
  }),
  clearAllMembersComments: () => set({ memberComments: {} }),
  lastRequestedOn: null as Date | null
}));

export const loadMemberComments = async (member: Member) => {
  try {
    console.log("Loading comments for member", member.id);
    const comments = await requestComments(member.OrganizationId, member.id);
    useMemberCommentsStore.getState().setMemberComments(member.id, comments);
  } catch (err) {
    console.log(err);
  }
};

export const updateAndPersistMemberComment = async (memberId: string, comment: Comment) => {
  try {
    if (comment.id) {
      // first check if any attachments were marked for deletion. If so, remove them from the comment
      const attachmentsToDelete = comment.Attachments.filter((a: any) => a.markedForDeletion);
      if (attachmentsToDelete.length > 0) {
        for (const a of attachmentsToDelete) {
          await requestDeleteAttachments(comment.OrganizationId, comment.MemberId, comment.id, a.id);
        }
      }

      // then update the comment
      comment.Attachments = comment.Attachments.filter((a: any) => !a.markedForDeletion);
      await requestUpdateComment(comment.OrganizationId, comment.MemberId, comment);
      comment.Attachments.map((a: any) => a.id = a.id || "new");
      useMemberCommentsStore.getState().updateMemberComment(memberId, comment);
    } else {
      console.log("CREATE");
      // create a new comment
      const newComment = await requestCreateComment(comment.OrganizationId, comment.MemberId, comment);
      useMemberCommentsStore.getState().addMemberComment(memberId, newComment);
    }
  } catch (err) {
    console.log(err);
  }
};

export const deleteMemberComment = async (memberId: string, comment: Comment) => {
  try {
    await requestDeleteComment(comment?.OrganizationId, comment?.MemberId, comment.id);
    useMemberCommentsStore.getState().removeMemberComment(memberId, comment.id);
  } catch (err) {
    console.log(err);
  }
};

export const clearMemberCommentsStore = () => {
  useMemberCommentsStore.getState().clearAllMembersComments();
  useMemberCommentsStore.getState().lastRequestedOn = null;
};