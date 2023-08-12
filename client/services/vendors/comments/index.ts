import { create } from "zustand";
import {
  requestComments,
  requestCreateComment,
  requestDeleteAttachments,
  requestDeleteComment,
  requestUpdateComment
} from "./api";
import { Comment, Vendor } from "@/types";

/**
 * {"vendorId":  {
 *        "comments": [{
 *                "id": "d6a7f941-5f07-4943-b005-1340ac1519b8",
 *                "content": "comment on vendor",
 *                "createdAt": "2023-07-28T15:37:31.323Z",
 *                "updatedAt": "2023-07-28T15:37:31.323Z",
 *                "OrganizationId": "559b0df0-621c-4d48-a58f-bf5d7dc7efed",
 *                "VendorId": "264bf6eb-819e-40ce-a418-dc5daea11752",
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

export const useVendorCommentsStore = create((set: any) => ({
  // vendorComments is a key value map of vendorId and an object with comments
  vendorComments: {} as Record<string, CommentStoreEntry>,
  setVendorComments: (vendorId: string, comments: any[]) => set((state: any) => ({
    vendorComments: {
      ...state.vendorComments,
      [vendorId]: comments
    }
  })),

  addVendorComment: (vendorId: string, comment: any) => set((state: any) => ({
    vendorComments: {
      ...(state.vendorComments || {}),
      [vendorId]: {
        ...(state.vendorComments[vendorId] || {}),
        comments: [
          ...(state.vendorComments[vendorId]?.comments || []),
          comment
        ]
      }
    }
  })),

  removeVendorComment: (vendorId: string, commentId: string) => set((state: any) => ({
    vendorComments: {
      ...state.vendorComments,
      [vendorId]: {
        ...state.vendorComments[vendorId],
        comments: [
          ...state.vendorComments[vendorId].comments.filter((c: any) => c.id !== commentId)
        ]
      }
    }
  })),

  updateVendorComment: (vendorId: string, comment: any) => set((state: any) => {
    const currentComments = state.vendorComments[vendorId].comments;

    return ({
      vendorComments: {
        ...state.vendorComments,
        [vendorId]: {
          ...state.vendorComments[vendorId],
          comments: currentComments.map((c: any) => c.id === comment.id ? comment : c)
        }
      }
    });
  }),
  clearAllVendorsComments: () => set({ vendorComments: {} }),
  lastRequestedOn: null as Date | null
}));

export const loadVendorComments = async (vendor: Vendor) => {
  try {
    console.log("Loading comments for vendor", vendor.id);
    const comments = await requestComments(vendor.OrganizationId, vendor.id);
    useVendorCommentsStore.getState().setVendorComments(vendor.id, comments);
  } catch (err) {
    console.log(err);
  }
};

export const updateAndPersistVendorComment = async (vendorId: string, comment: Comment) => {
  try {
    if (comment.id) {
      // first check if any attachments were marked for deletion. If so, remove them from the comment
      const attachmentsToDelete = comment.Attachments.filter((a: any) => a.markedForDeletion);
      if (attachmentsToDelete.length > 0) {
        for (const a of attachmentsToDelete) {
          await requestDeleteAttachments(comment.OrganizationId, comment.VendorId, comment.id, a.id);
        }
      }

      // then update the comment
      comment.Attachments = comment.Attachments.filter((a: any) => !a.markedForDeletion);
      await requestUpdateComment(comment.OrganizationId, comment.VendorId, comment);
      comment.Attachments.map((a: any) => a.id = a.id || "new");
      useVendorCommentsStore.getState().updateVendorComment(vendorId, comment);
    } else {
      console.log("CREATE");
      // create a new comment
      const newComment = await requestCreateComment(comment.OrganizationId, comment.VendorId, comment);
      useVendorCommentsStore.getState().addVendorComment(vendorId, newComment);
    }
  } catch (err) {
    throw err;
  }
};

export const deleteVendorComment = async (vendorId: string, comment: Comment) => {
  try {
    await requestDeleteComment(comment?.OrganizationId, comment?.VendorId, comment.id);
    useVendorCommentsStore.getState().removeVendorComment(vendorId, comment.id);
  } catch (err) {
    console.log(err);
  }
};

export const clearVendorCommentsStore = () => {
  useVendorCommentsStore.getState().clearAllVendorsComments();
  useVendorCommentsStore.getState().lastRequestedOn = null;
};