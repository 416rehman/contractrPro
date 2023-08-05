import { Comment, Vendor } from "@/types";
import {
  deleteVendorComment,
  loadVendorComments,
  updateAndPersistVendorComment,
  useVendorCommentsStore
} from "@/services/vendors/comments";
import { useEffect, useState } from "react";
import { useToastsStore } from "@/services/toast";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import CommentComponent from "@/components/commentComponent";

type Props = {
  vendor?: Vendor
}

const emptyComment: Comment = {
  "id": "",
  "AuthorId": "",
  "content": "",
  "Attachments": [],
  "createdAt": "",
  "updatedAt": "",
  VendorId: "",
  ContractId: "",
  ClientId: "",
  OrganizationId: "",
  ExpenseId: "",
  InvoiceId: "",
  UpdatedByUserId: ""
};

/**
 * A comment section for a vendor. It must display all the comments for the vendor.
 * It must display a form to add a new comment at all times.
 */
export default function VendorCommentSection({ vendor }: Props) {

  const vendorCommentsMap = useVendorCommentsStore(state => state.vendorComments);
  const [currentVendorComments, setCurrentVendorComments] = useState<any>({});

  const [newComment, setNewComment] = useState<Comment>(emptyComment);

  const commentSaveHandler = async (editedComment) => {
    try {
      if (!editedComment?.id) {
        // if the comment doesnt exist and has no content or attachments, dont save it
        if (!editedComment?.content && editedComment?.Attachments?.length === 0) return;

        // set the vendor id and organization id
        editedComment.VendorId = vendor?.id;
        editedComment.OrganizationId = vendor?.OrganizationId;
      }

      await updateAndPersistVendorComment(vendor?.id, editedComment);
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
      await deleteVendorComment(vendor?.id, comment);
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
    if (vendor?.id) {
      loadVendorComments(vendor);
    } else {
      setCurrentVendorComments({});
    }
  }, [vendor]);

  useEffect(() => {
    setNewComment((prev) => ({ ...emptyComment }));
    const vendorComments = vendorCommentsMap[vendor?.id];
    if (!vendorComments) return;
    if (!vendorComments.comments) vendorComments.comments = [];
    vendorComments.comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setCurrentVendorComments(vendorComments);
  }, [vendorCommentsMap, vendor]);

  return (
    <Card shadow={"none"} className={"border border-default-100 rounded-md print:hidden"}>
      <CardHeader>
        <span
          className={"font-medium text-default-500"}>{vendorCommentsMap[vendor?.id]?.comments?.length ? vendorCommentsMap[vendor?.id]?.comments?.length + " Comments" : "Be the first to comment"}</span>
      </CardHeader>
      <CardBody className={"flex flex-col gap-5"}>
        {currentVendorComments?.comments?.length > 0 &&
          currentVendorComments?.comments?.map((comment) => (
            <CommentComponent key={comment.id} comment={comment}
                              onSave={commentSaveHandler}
                              onDelete={() => commentDeleteHandler(comment)} />))
        }
        <CommentComponent comment={newComment} onSave={commentSaveHandler} />
      </CardBody>
    </Card>
  );
}