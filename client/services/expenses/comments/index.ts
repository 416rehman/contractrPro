import { create } from "zustand";
import {
  requestComments,
  requestCreateComment,
  requestDeleteAttachments,
  requestDeleteComment,
  requestUpdateComment
} from "./api";
import { Comment, Expense } from "@/types";

/**
 * {"expenseId":  {
 *        "comments": [{
 *                "id": "d6a7f941-5f07-4943-b005-1340ac1519b8",
 *                "content": "comment on expense",
 *                "createdAt": "2023-07-28T15:37:31.323Z",
 *                "updatedAt": "2023-07-28T15:37:31.323Z",
 *                "OrganizationId": "559b0df0-621c-4d48-a58f-bf5d7dc7efed",
 *                "ExpenseId": "264bf6eb-819e-40ce-a418-dc5daea11752",
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

export const useExpenseCommentsStore = create((set: any) => ({
  // expenseComments is a key value map of expenseId and an object with comments
  expenseComments: {} as Record<string, CommentStoreEntry>,
  setExpenseComments: (expenseId: string, comments: any[]) => set((state: any) => ({
    expenseComments: {
      ...state.expenseComments,
      [expenseId]: comments
    }
  })),

  addExpenseComment: (expenseId: string, comment: any) => set((state: any) => ({
    expenseComments: {
      ...(state.expenseComments || {}),
      [expenseId]: {
        ...(state.expenseComments[expenseId] || {}),
        comments: [
          ...(state.expenseComments[expenseId]?.comments || []),
          comment
        ]
      }
    }
  })),

  removeExpenseComment: (expenseId: string, commentId: string) => set((state: any) => ({
    expenseComments: {
      ...state.expenseComments,
      [expenseId]: {
        ...state.expenseComments[expenseId],
        comments: [
          ...state.expenseComments[expenseId].comments.filter((c: any) => c.id !== commentId)
        ]
      }
    }
  })),

  updateExpenseComment: (expenseId: string, comment: any) => set((state: any) => {
    const currentComments = state.expenseComments[expenseId].comments;

    return ({
      expenseComments: {
        ...state.expenseComments,
        [expenseId]: {
          ...state.expenseComments[expenseId],
          comments: currentComments.map((c: any) => c.id === comment.id ? comment : c)
        }
      }
    });
  }),
  clearAllExpensesComments: () => set({ expenseComments: {} }),
  lastRequestedOn: null as Date | null
}));

export const loadExpenseComments = async (expense: Expense) => {
  try {
    console.log("Loading comments for expense", expense.id);
    const comments = await requestComments(expense.OrganizationId, expense.id);
    useExpenseCommentsStore.getState().setExpenseComments(expense.id, comments);
  } catch (err) {
    console.log(err);
  }
};

export const updateAndPersistExpenseComment = async (expenseId: string, comment: Comment) => {
  try {
    if (comment.id) {
      // first check if any attachments were marked for deletion. If so, remove them from the comment
      const attachmentsToDelete = comment.Attachments.filter((a: any) => a.markedForDeletion);
      if (attachmentsToDelete.length > 0) {
        for (const a of attachmentsToDelete) {
          await requestDeleteAttachments(comment.OrganizationId, comment.ExpenseId, comment.id, a.id);
        }
      }

      // then update the comment
      comment.Attachments = comment.Attachments.filter((a: any) => !a.markedForDeletion);
      await requestUpdateComment(comment.OrganizationId, comment.ExpenseId, comment);
      comment.Attachments.map((a: any) => a.id = a.id || "new");
      useExpenseCommentsStore.getState().updateExpenseComment(expenseId, comment);
    } else {
      console.log("CREATE");
      // create a new comment
      const newComment = await requestCreateComment(comment.OrganizationId, comment.ExpenseId, comment);
      useExpenseCommentsStore.getState().addExpenseComment(expenseId, newComment);
    }
  } catch (err) {
    console.log(err);
  }
};

export const deleteExpenseComment = async (expenseId: string, comment: Comment) => {
  try {
    await requestDeleteComment(comment?.OrganizationId, comment?.ExpenseId, comment.id);
    useExpenseCommentsStore.getState().removeExpenseComment(expenseId, comment.id);
  } catch (err) {
    console.log(err);
  }
};

export const clearExpenseCommentsStore = () => {
  useExpenseCommentsStore.getState().clearAllExpensesComments();
  useExpenseCommentsStore.getState().lastRequestedOn = null;
};