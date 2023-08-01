import { Comment, Invoice } from "@/types";
import {
  deleteInvoiceComment,
  loadInvoiceComments,
  updateAndPersistInvoiceComment,
  useInvoiceCommentsStore
} from "@/services/invoices/comments";
import { useEffect, useState } from "react";
import { useToastsStore } from "@/services/toast";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import CommentComponent from "@/components/commentComponent";

type Props = {
  invoice?: Invoice
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
 * A comment section for an invoice. It must display all the comments for the invoice.
 * It must display a form to add a new comment at all times.
 */
export default function InvoiceCommentSection({ invoice }: Props) {

  const invoiceCommentsMap = useInvoiceCommentsStore(state => state.invoiceComments);
  const [currentInvoiceComments, setCurrentInvoiceComments] = useState<any>({});

  const [newComment, setNewComment] = useState<Comment>(emptyComment);

  const commentSaveHandler = async (editedComment) => {
    try {
      if (!editedComment?.id) {
        // if the comment doesnt exist and has no content or attachments, dont save it
        if (!editedComment?.content && editedComment?.Attachments?.length === 0) return;

        // set the invoice id and organization id
        editedComment.InvoiceId = invoice?.id;
        editedComment.OrganizationId = invoice?.OrganizationId;
      }

      await updateAndPersistInvoiceComment(invoice?.id, editedComment);
    } catch (e) {
      useToastsStore.getState().addToast({
        id: "comment-save-error",
        title: "Error",
        message: e.message || "An error occurred while saving the comment",
        type: "error"
      });
    }
  };

  const commentDeleteHandler = async (comment) => {
    try {
      await deleteInvoiceComment(invoice?.id, comment);
    } catch (e) {
      useToastsStore.getState().addToast({
        id: "comment-delete-error",
        title: "Error",
        message: e.message || "An error occurred while deleting the comment",
        type: "error"
      });
    }
  };

  useEffect(() => {
    if (invoice?.id) {
      loadInvoiceComments(invoice);
    } else {
      setCurrentInvoiceComments({});
    }
  }, [invoice]);

  useEffect(() => {
    setNewComment((prev) => ({ ...emptyComment }));
    const invoiceComments = invoiceCommentsMap[invoice?.id];
    if (!invoiceComments) return;
    if (!invoiceComments.comments) invoiceComments.comments = [];
    invoiceComments.comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setCurrentInvoiceComments(invoiceComments);
  }, [invoiceCommentsMap, invoice]);

  return (
    <Card shadow={"none"} className={"border border-default-100 rounded-md print:hidden"}>
      <CardHeader>
        <span
          className={"font-medium text-default-500"}>{invoiceCommentsMap[invoice?.id]?.comments?.length ? invoiceCommentsMap[invoice?.id]?.comments?.length + " Comments" : "Be the first to comment"}</span>
      </CardHeader>
      <CardBody className={"flex flex-col gap-5"}>
        {currentInvoiceComments?.comments?.length > 0 &&
          currentInvoiceComments?.comments?.map((comment) => (
            <CommentComponent key={comment.id} comment={comment}
                              onSave={commentSaveHandler}
                              onDelete={() => commentDeleteHandler(comment)} />))
        }
        <CommentComponent comment={newComment} onSave={commentSaveHandler} />
      </CardBody>
    </Card>
  );
}