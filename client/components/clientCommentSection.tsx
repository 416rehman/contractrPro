import { Client, Comment } from "@/types";
import {
  deleteClientComment,
  loadClientComments,
  updateAndPersistClientComment,
  useClientCommentsStore
} from "@/services/clients/comments";
import { useEffect, useState } from "react";
import { useToastsStore } from "@/services/toast";
import { Card, CardBody, CardHeader } from "@heroui/card";
import CommentComponent from "@/components/commentComponent";

type Props = {
  client?: Client
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
 * A comment section for a client. It must display all the comments for the client.
 * It must display a form to add a new comment at all times.
 */
export default function ClientCommentSection({ client }: Props) {

  const clientCommentsMap = useClientCommentsStore(state => state.clientComments);
  const [currentClientComments, setCurrentClientComments] = useState<any>({});

  const [newComment, setNewComment] = useState<Comment>(emptyComment);

  const commentSaveHandler = async (editedComment: Comment) => {
    try {
      if (!editedComment?.id) {
        // if the comment doesnt exist and has no content or attachments, dont save it
        if (!editedComment?.content && editedComment?.Attachments?.length === 0) return;

        // set the client id and organization id
        editedComment.ClientId = client?.id;
        editedComment.OrganizationId = client?.OrganizationId;
      }

      await updateAndPersistClientComment(client?.id, editedComment);
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
      await deleteClientComment(client?.id, comment);
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
    if (client?.id) {
      loadClientComments(client);
    } else {
      setCurrentClientComments({});
    }
  }, [client]);

  useEffect(() => {
    setNewComment((prev) => ({ ...emptyComment }));
    const clientComments = clientCommentsMap[client?.id];
    if (!clientComments) return;
    if (!clientComments.comments) clientComments.comments = [];
    clientComments.comments.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    setCurrentClientComments(clientComments);
  }, [clientCommentsMap, client]);

  return (
    <Card shadow={"none"} className={"border border-default-100 rounded-md print:hidden"}>
      <CardHeader>
        <span
          className={"font-medium text-default-500"}>{clientCommentsMap[client?.id]?.comments?.length ? clientCommentsMap[client?.id]?.comments?.length + " Comments" : "Be the first to comment"}</span>
      </CardHeader>
      <CardBody className={"flex flex-col gap-5"}>
        {currentClientComments?.comments?.length > 0 &&
          currentClientComments?.comments?.map((comment: Comment) => (
            <CommentComponent key={comment.id} comment={comment}
              onSave={commentSaveHandler}
              onDelete={() => commentDeleteHandler(comment)} />))
        }
        <CommentComponent comment={newComment} onSave={commentSaveHandler} />
      </CardBody>
    </Card>
  );
}