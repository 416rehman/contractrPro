import { create } from "zustand";
import {
  requestComments,
  requestCreateComment,
  requestDeleteAttachments,
  requestDeleteComment,
  requestUpdateComment
} from "./api";
import { Client, Comment } from "@/types";

/**
 * {"clientId":  {
 *        "comments": [{
 *                "id": "d6a7f941-5f07-4943-b005-1340ac1519b8",
 *                "content": "comment on client",
 *                "createdAt": "2023-07-28T15:37:31.323Z",
 *                "updatedAt": "2023-07-28T15:37:31.323Z",
 *                "OrganizationId": "559b0df0-621c-4d48-a58f-bf5d7dc7efed",
 *                "ClientId": "264bf6eb-819e-40ce-a418-dc5daea11752",
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

export const useClientCommentsStore = create((set: any) => ({
  // clientComments is a key value map of clientId and an object with comments
  clientComments: {} as Record<string, CommentStoreEntry>,
  setClientComments: (clientId: string, comments: any[]) => set((state: any) => ({
    clientComments: {
      ...state.clientComments,
      [clientId]: comments
    }
  })),

  addClientComment: (clientId: string, comment: any) => set((state: any) => ({
    clientComments: {
      ...(state.clientComments || {}),
      [clientId]: {
        ...(state.clientComments[clientId] || {}),
        comments: [
          ...(state.clientComments[clientId]?.comments || []),
          comment
        ]
      }
    }
  })),

  removeClientComment: (clientId: string, commentId: string) => set((state: any) => ({
    clientComments: {
      ...state.clientComments,
      [clientId]: {
        ...state.clientComments[clientId],
        comments: [
          ...state.clientComments[clientId].comments.filter((c: any) => c.id !== commentId)
        ]
      }
    }
  })),

  updateClientComment: (clientId: string, comment: any) => set((state: any) => {
    const currentComments = state.clientComments[clientId].comments;

    return ({
      clientComments: {
        ...state.clientComments,
        [clientId]: {
          ...state.clientComments[clientId],
          comments: currentComments.map((c: any) => c.id === comment.id ? comment : c)
        }
      }
    });
  }),
  clearAllClientsComments: () => set({ clientComments: {} }),
  lastRequestedOn: null as Date | null
}));

export const loadClientComments = async (client: Client) => {
  try {
    console.log("Loading comments for client", client.id);
    const comments = await requestComments(client.OrganizationId, client.id);
    useClientCommentsStore.getState().setClientComments(client.id, comments);
  } catch (err) {
    console.log(err);
  }
};

export const updateAndPersistClientComment = async (clientId: string, comment: Comment) => {
  try {
    if (comment.id) {
      // first check if any attachments were marked for deletion. If so, remove them from the comment
      const attachmentsToDelete = comment.Attachments.filter((a: any) => a.markedForDeletion);
      if (attachmentsToDelete.length > 0) {
        for (const a of attachmentsToDelete) {
          await requestDeleteAttachments(comment.OrganizationId, comment.ClientId, comment.id, a.id);
        }
      }

      // then update the comment
      comment.Attachments = comment.Attachments.filter((a: any) => !a.markedForDeletion);
      await requestUpdateComment(comment.OrganizationId, comment.ClientId, comment);
      comment.Attachments.map((a: any) => a.id = a.id || "new");
      useClientCommentsStore.getState().updateClientComment(clientId, comment);
    } else {
      console.log("CREATE");
      // create a new comment
      const newComment = await requestCreateComment(comment.OrganizationId, comment.ClientId, comment);
      useClientCommentsStore.getState().addClientComment(clientId, newComment);
    }
  } catch (err) {
    console.log(err);
  }
};

export const deleteClientComment = async (clientId: string, comment: Comment) => {
  try {
    await requestDeleteComment(comment?.OrganizationId, comment?.ClientId, comment.id);
    useClientCommentsStore.getState().removeClientComment(clientId, comment.id);
  } catch (err) {
    console.log(err);
  }
};

export const clearClientCommentsStore = () => {
  useClientCommentsStore.getState().clearAllClientsComments();
  useClientCommentsStore.getState().lastRequestedOn = null;
};