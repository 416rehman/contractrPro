import { create } from "zustand";
import {
  requestComments,
  requestCreateComment,
  requestDeleteAttachments,
  requestDeleteComment,
  requestUpdateComment
} from "./api";
import { Comment, Invoice } from "@/types";

/**
 * {"invoiceId":  {
 *        "comments": [{
 *                "id": "d6a7f941-5f07-4943-b005-1340ac1519b8",
 *                "content": "comment on invoice",
 *                "createdAt": "2023-07-28T15:37:31.323Z",
 *                "updatedAt": "2023-07-28T15:37:31.323Z",
 *                "OrganizationId": "559b0df0-621c-4d48-a58f-bf5d7dc7efed",
 *                "InvoiceId": "264bf6eb-819e-40ce-a418-dc5daea11752",
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

export const useInvoiceCommentsStore = create((set: any) => ({
  // invoiceComments is a key value map of invoiceId and an object with comments
  invoiceComments: {} as Record<string, CommentStoreEntry>,
  setInvoiceComments: (invoiceId: string, comments: any[]) => set((state: any) => ({
    invoiceComments: {
      ...state.invoiceComments,
      [invoiceId]: comments
    }
  })),

  addInvoiceComment: (invoiceId: string, comment: any) => set((state: any) => ({
    invoiceComments: {
      ...(state.invoiceComments || {}),
      [invoiceId]: {
        ...(state.invoiceComments[invoiceId] || {}),
        comments: [
          ...(state.invoiceComments[invoiceId]?.comments || []),
          comment
        ]
      }
    }
  })),

  removeInvoiceComment: (invoiceId: string, commentId: string) => set((state: any) => ({
    invoiceComments: {
      ...state.invoiceComments,
      [invoiceId]: {
        ...state.invoiceComments[invoiceId],
        comments: [
          ...state.invoiceComments[invoiceId].comments.filter((c: any) => c.id !== commentId)
        ]
      }
    }
  })),

  updateInvoiceComment: (invoiceId: string, comment: any) => set((state: any) => {
    const currentComments = state.invoiceComments[invoiceId].comments;

    return ({
      invoiceComments: {
        ...state.invoiceComments,
        [invoiceId]: {
          ...state.invoiceComments[invoiceId],
          comments: currentComments.map((c: any) => c.id === comment.id ? comment : c)
        }
      }
    });
  }),
  clearAllInvoicesComments: () => set({ invoiceComments: {} }),
  lastRequestedOn: null as Date | null
}));

export const loadInvoiceComments = async (invoice: Invoice) => {
  try {
    console.log("Loading comments for invoice", invoice.id);
    const comments = await requestComments(invoice.OrganizationId, invoice.id);
    useInvoiceCommentsStore.getState().setInvoiceComments(invoice.id, comments);
  } catch (err) {
    console.log(err);
  }
};

export const updateAndPersistInvoiceComment = async (invoiceId: string, comment: Comment) => {
  try {
    if (comment.id) {
      // first check if any attachments were marked for deletion. If so, remove them from the comment
      const attachmentsToDelete = comment.Attachments?.filter((a: any) => a.markedForDeletion) || [];
      if (attachmentsToDelete.length > 0) {
        for (const a of attachmentsToDelete) {
          await requestDeleteAttachments(comment.OrganizationId || "", comment.InvoiceId || "", comment.id, a.id);
        }
      }

      // then update the comment
      comment.Attachments = comment.Attachments?.filter((a: any) => !a.markedForDeletion);
      await requestUpdateComment(comment.OrganizationId || "", comment.InvoiceId || "", comment);
      comment.Attachments?.map((a: any) => a.id = a.id || "new");
      useInvoiceCommentsStore.getState().updateInvoiceComment(invoiceId, comment);
    } else {
      console.log("CREATE");
      // create a new comment
      const newComment = await requestCreateComment(comment.OrganizationId || "", comment.InvoiceId || "", comment);
      useInvoiceCommentsStore.getState().addInvoiceComment(invoiceId, newComment);
    }
  } catch (err) {
    console.log(err);
  }
};

export const deleteInvoiceComment = async (invoiceId: string, comment: Comment) => {
  try {
    await requestDeleteComment(comment?.OrganizationId || "", comment?.InvoiceId || "", comment.id || "");
    useInvoiceCommentsStore.getState().removeInvoiceComment(invoiceId, comment.id || "");
  } catch (err) {
    console.log(err);
  }
};

export const clearInvoiceCommentsStore = () => {
  useInvoiceCommentsStore.getState().clearAllInvoicesComments();
  useInvoiceCommentsStore.getState().lastRequestedOn = null;
};