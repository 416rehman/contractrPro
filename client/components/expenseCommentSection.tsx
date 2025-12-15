import { Comment, Expense } from "@/types";
import {
  deleteExpenseComment,
  loadExpenseComments,
  updateAndPersistExpenseComment,
  useExpenseCommentsStore
} from "@/services/expenses/comments";
import { useEffect, useState } from "react";
import { useToastsStore } from "@/services/toast";
import { Card, CardBody, CardHeader } from "@heroui/card";
import CommentComponent from "@/components/commentComponent";

type Props = {
  expense?: Expense
}

const emptyComment: Comment = {
  "id": "",
  "AuthorId": "",
  "content": "",
  "Attachments": [],
  "createdAt": "",
  "updatedAt": "",
  ClientId: "",
  ContractId: "",
  VendorId: "",
  OrganizationId: "",
  ExpenseId: "",
  InvoiceId: "",
  UpdatedByUserId: ""
};

/**
 * A comment section for an expense. It must display all the comments for the expense.
 * It must display a form to add a new comment at all times.
 */
export default function ExpenseCommentSection({ expense }: Props) {

  const expenseCommentsMap = useExpenseCommentsStore(state => state.expenseComments);
  const [currentExpenseComments, setCurrentExpenseComments] = useState<any>({});

  const [newComment, setNewComment] = useState<Comment>(emptyComment);

  const commentSaveHandler = async (editedComment: Comment) => {
    try {
      if (!editedComment?.id) {
        // if the comment doesnt exist and has no content or attachments, dont save it
        if (!editedComment?.content && editedComment?.Attachments?.length === 0) return;

        // set the expense id and organization id
        editedComment.ExpenseId = expense?.id;
        editedComment.OrganizationId = expense?.OrganizationId;
      }

      await updateAndPersistExpenseComment(expense?.id!, editedComment);
    } catch (e) {
      useToastsStore.getState().addToast({
        id: "comment-save-error",
        title: "Error",
        message: (e as any).message || "An error occurred while saving the comment",
        type: "error"
      });
    }
  };

  const commentDeleteHandler = async (comment: Comment) => {
    try {
      await deleteExpenseComment(expense?.id!, comment);
    } catch (e) {
      useToastsStore.getState().addToast({
        id: "comment-delete-error",
        title: "Error",
        message: (e as any).message || "An error occurred while deleting the comment",
        type: "error"
      });
    }
  };

  useEffect(() => {
    if (expense?.id) {
      loadExpenseComments(expense);
    } else {
      setCurrentExpenseComments({});
    }
  }, [expense]);

  useEffect(() => {
    setNewComment((prev) => ({ ...emptyComment }));
    if (!expense?.id) return;
    const expenseComments = expenseCommentsMap[expense.id];
    if (!expenseComments) return;
    if (!expenseComments.comments) expenseComments.comments = [];
    expenseComments.comments.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    setCurrentExpenseComments(expenseComments);
  }, [expenseCommentsMap, expense]);

  return (
    <Card shadow={"none"} className={"border border-default-100 rounded-md print:hidden"}>
      <CardHeader>
        <span
          className={"font-medium text-default-500"}>{currentExpenseComments?.comments?.length ? currentExpenseComments?.comments?.length + " Comments" : "Be the first to comment"}</span>
      </CardHeader>
      <CardBody className={"flex flex-col gap-5"}>
        {currentExpenseComments?.comments?.length > 0 &&
          currentExpenseComments?.comments?.map((comment: Comment) => (
            <CommentComponent key={comment.id} comment={comment}
              onSave={commentSaveHandler}
              onDelete={() => commentDeleteHandler(comment)} />))
        }
        <CommentComponent comment={newComment} onSave={commentSaveHandler} />
      </CardBody>
    </Card>
  );
}