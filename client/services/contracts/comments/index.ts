import { create } from "zustand";
import {
  requestComments,
  requestCreateComment,
  requestDeleteAttachments,
  requestDeleteComment,
  requestUpdateComment
} from "./api";
import { Comment, Contract } from "@/types";

/**
 * {"contractId":  {
 *        "comments": [{
 *                "id": "d6a7f941-5f07-4943-b005-1340ac1519b8",
 *                "content": "comment on contract",
 *                "createdAt": "2023-07-28T15:37:31.323Z",
 *                "updatedAt": "2023-07-28T15:37:31.323Z",
 *                "OrganizationId": "559b0df0-621c-4d48-a58f-bf5d7dc7efed",
 *                "ContractId": "264bf6eb-819e-40ce-a418-dc5daea11752",
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

export const useContractCommentsStore = create((set: any) => ({
  // contractComments is a key value map of contractId and an object with comments
  contractComments: {} as Record<string, CommentStoreEntry>,
  setContractComments: (contractId: string, comments: any[]) => set((state: any) => ({
    contractComments: {
      ...state.contractComments,
      [contractId]: comments
    }
  })),

  addContractComment: (contractId: string, comment: any) => set((state: any) => ({
    contractComments: {
      ...(state.contractComments || {}),
      [contractId]: {
        ...(state.contractComments[contractId] || {}),
        comments: [
          ...(state.contractComments[contractId]?.comments || []),
          comment
        ]
      }
    }
  })),

  removeContractComment: (contractId: string, commentId: string) => set((state: any) => ({
    contractComments: {
      ...state.contractComments,
      [contractId]: {
        ...state.contractComments[contractId],
        comments: [
          ...state.contractComments[contractId].comments.filter((c: any) => c.id !== commentId)
        ]
      }
    }
  })),

  updateContractComment: (contractId: string, comment: any) => set((state: any) => {
    const currentComments = state.contractComments[contractId].comments;

    return ({
      contractComments: {
        ...state.contractComments,
        [contractId]: {
          ...state.contractComments[contractId],
          comments: currentComments.map((c: any) => c.id === comment.id ? comment : c)
        }
      }
    });
  }),
  clearAllContractsComments: () => set({ contractComments: {} }),
  lastRequestedOn: null as Date | null
}));

export const loadContractComments = async (contract: Contract) => {
  try {
    console.log("Loading comments for contract", contract.id);
    const comments = await requestComments(contract.OrganizationId || "", contract.id || "");
    useContractCommentsStore.getState().setContractComments(contract.id || "", comments);
  } catch (err) {
    console.log(err);
  }
};

export const updateAndPersistContractComment = async (contractId: string, comment: Comment) => {
  try {
    if (comment.id) {
      // first check if any attachments were marked for deletion. If so, remove them from the comment
      const attachmentsToDelete = comment.Attachments?.filter((a: any) => a.markedForDeletion) || [];
      if (attachmentsToDelete.length > 0) {
        for (const a of attachmentsToDelete) {
          await requestDeleteAttachments(comment.OrganizationId || "", comment.ContractId || "", comment.id, a.id);
        }
      }

      // then update the comment
      comment.Attachments = comment.Attachments?.filter((a: any) => !a.markedForDeletion);
      await requestUpdateComment(comment.OrganizationId || "", comment.ContractId || "", comment);
      comment.Attachments?.map((a: any) => a.id = a.id || "new");
      useContractCommentsStore.getState().updateContractComment(contractId, comment);
    } else {
      console.log("CREATE");
      // create a new comment
      const newComment = await requestCreateComment(comment.OrganizationId || "", comment.ContractId || "", comment);
      useContractCommentsStore.getState().addContractComment(contractId, newComment);
    }
  } catch (err) {
    console.log(err);
  }
};

export const deleteContractComment = async (contractId: string, comment: Comment) => {
  try {
    await requestDeleteComment(comment?.OrganizationId || "", comment?.ContractId || "", comment.id || "");
    useContractCommentsStore.getState().removeContractComment(contractId, comment.id || "");
  } catch (err) {
    console.log(err);
  }
};

export const clearContractCommentsStore = () => {
  useContractCommentsStore.getState().clearAllContractsComments();
  useContractCommentsStore.getState().lastRequestedOn = null;
};