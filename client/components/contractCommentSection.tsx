import { Comment, Contract } from "@/types";
import {
  deleteContractComment,
  loadContractComments,
  updateAndPersistContractComment,
  useContractCommentsStore
} from "@/services/contracts/comments";
import { useEffect, useState } from "react";
import { useToastsStore } from "@/services/toast";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import CommentComponent from "@/components/commentComponent";

type Props = {
  contract?: Contract
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
 * A comment section for a contract. It must display all the comments for the contract.
 * It must display a form to add a new comment at all times.
 */
export default function ContractCommentSection({ contract }: Props) {

  const contractCommentsMap = useContractCommentsStore(state => state.contractComments);
  const [currentContractComments, setCurrentContractComments] = useState<any>({});

  const [newComment, setNewComment] = useState<Comment>(emptyComment);

  const commentSaveHandler = async (editedComment) => {
    try {
      if (!editedComment?.id) {
        // if the comment doesnt exist and has no content or attachments, dont save it
        if (!editedComment?.content && editedComment?.Attachments?.length === 0) return;

        // set the contract id and organization id
        editedComment.ContractId = contract?.id;
        editedComment.OrganizationId = contract?.OrganizationId;
      }

      await updateAndPersistContractComment(contract?.id, editedComment);
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
      await deleteContractComment(contract?.id, comment);
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
    if (contract?.id) {
      loadContractComments(contract);
    } else {
      setCurrentContractComments({});
    }
  }, [contract]);

  useEffect(() => {
    setNewComment((prev) => ({ ...emptyComment }));
    const contractComments = contractCommentsMap[contract?.id];
    if (!contractComments) return;
    if (!contractComments.comments) contractComments.comments = [];
    contractComments.comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setCurrentContractComments(contractComments);
  }, [contractCommentsMap, contract]);

  return (
    <Card shadow={"none"} className={"border border-default-100 rounded-md print:hidden"}>
      <CardHeader>
        <span
          className={"font-medium text-default-500"}>{contractCommentsMap[contract?.id]?.comments?.length ? contractCommentsMap[contract?.id]?.comments?.length + " Comments" : "Be the first to comment"}</span>
      </CardHeader>
      <CardBody className={"flex flex-col gap-5"}>
        {currentContractComments?.comments?.length > 0 &&
          currentContractComments?.comments?.map((comment) => (
            <CommentComponent key={comment.id} comment={comment}
                              onSave={commentSaveHandler}
                              onDelete={() => commentDeleteHandler(comment)} />))
        }
        <CommentComponent comment={newComment} onSave={commentSaveHandler} />
      </CardBody>
    </Card>
  );
}