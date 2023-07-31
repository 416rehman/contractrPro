import React, { useCallback, useEffect, useRef, useState } from "react";
import { CardFooter, Textarea } from "@nextui-org/react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import clsx from "clsx";
import { Button } from "@nextui-org/button";
import Attachment from "@/components/attachment";
import { IconDotsVertical, IconEdit, IconPaperclip } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Comment } from "@/types";
import { Link } from "@nextui-org/link";
import { loadMembers, useMembersStore } from "@/services/members";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";

type CommentProps = {
  comment: Comment
  onSave?: (editedComment: Comment) => {}
  onDelete?: () => {}
}

/**
 * A component to display and or edit a comment. Must show the author, date, content and any attachments if it is an existing comment.
 * If it is a new comment, it must show a textarea to edit the content, an area to add attachments, and a button to save it.
 * If it is an existing comment, it must show a button to edit it, and a button to delete it.
 * If it is being edited, it must show a button to cancel the edition.
 * Dragging and dropping files into the comment must add them as attachments ONLY if comment is new or being edited.
 */
export default function CommentComponent({ comment, onSave, onDelete }: CommentProps) {
  const [editedComment, setEditedComment] = useState<Comment>();
  useEffect(() => {
    setEditedComment(comment);
  }, [comment]);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles) {
      // add files to the attachments array, if it doesn't exist, create it
      if (!editedComment?.Attachments) {
        setEditedComment({ ...editedComment, Attachments: [] });
      }
      setEditedComment({ ...editedComment, Attachments: [...editedComment?.Attachments, ...acceptedFiles] });
    }
  }, [editedComment]);

  const members = useMembersStore(state => state.members);
  useEffect(() => {
    // if there are no members, load them
    if (!members || members.length === 0 && comment?.OrganizationId) {
      loadMembers(comment?.OrganizationId);
    }
  }, [comment?.OrganizationId, members]);

  const [author, setAuthor] = useState<any>();
  useEffect(() => {
    if (editedComment?.AuthorId) {
      setAuthor(members.find(member => member.UserId === editedComment?.AuthorId));
    }
  }, [comment?.OrganizationId, editedComment?.AuthorId, members]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const OnChangeFileInput = (event: any) => {
    const newFiles = event.target.files;
    if (newFiles) {
      // add files to the attachments array, if it doesn't exist, create it
      if (!editedComment?.Attachments) {
        setEditedComment({ ...editedComment, Attachments: [] });
      }
      setEditedComment({ ...editedComment, Attachments: [...editedComment?.Attachments, ...newFiles] });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const OnClickAddAttachment = () => {
    fileInputRef.current?.click();
  };

  const [isEditing, setIsEditing] = useState(!comment?.id);
  const [isSaving, setIsSaving] = useState(false);

  const saveHandler = async () => {
    setIsSaving(true);
    await onSave?.(editedComment);

    setIsSaving(false);
  };

  const onAction = async (action: string) => {
    switch (action) {
      case "edit":
        setIsEditing(true);
        break;
      case "delete":
        setIsSaving(true);
        await onDelete?.();
    }
  };

  return (
    <div className={"flex flex-col gap-2"}>
      <Card {...(isEditing ? getRootProps() : {})} isPressable={false}
            className={clsx("flex flex-col border border-default-200 rounded-md", { "border-primary-100": isDragActive })}
            shadow={"none"}>
        {editedComment?.id &&
          <CardHeader className={"px-2 py-1 justify-between bg-content2 rounded-t-md"}>
            <div className={"flex gap-1"}>
              <Link href={author?.id ? `/members/${author?.id}` : "#"}
                    className={"text-sm bg-primary-100 rounded-md px-1 py-0"}>
                {author?.name || "❔Anonymous"}
              </Link>
              <span className={"text-sm text-gray-500"}>
                commented on
                <span className={"font-medium"}> {new Date(editedComment?.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
            {!isEditing &&
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly={true} variant={"light"} className={"p-0"} size={"sm"}>
                    <IconDotsVertical size={18} className={"text-default-700"} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu onAction={onAction}>
                  <DropdownItem key="edit" startContent={<IconEdit size={18} className={"text-gray-500"} />}
                                description={"Edit this comment"}>
                    Edit
                  </DropdownItem>
                  <DropdownItem key="delete" startContent={<IconEdit size={18} />}
                                description={"Delete this comment"} className="text-danger" color="danger">
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>}
          </CardHeader>}
        <CardBody className={clsx("flex-grow flex p-0 ", { "resize-y min-h-[100px]": isEditing })}>
          <Textarea variant={"underlined"} placeholder={"Write a comment"} value={editedComment?.content}
                    isReadOnly={!isEditing}
                    onChange={(event) => setEditedComment({ ...editedComment, content: event.target.value })}
                    classNames={{
                      input: "h-full flex-grow p-2",
                      base: "h-full flex-grow",
                      inputWrapper: "h-full flex-grow"
                    }} />
        </CardBody>
        <CardFooter className={"flex flex-col items-start p-0 rounded-none border-none"}>
          <input className={"hidden"} type={"file"} accept={"*/*"} multiple={true}
                 {...getInputProps()} ref={fileInputRef}
                 onChange={OnChangeFileInput} />
          <Card
            className={clsx("w-full h-full p-0 gap-2 rounded-none bg-default-100", (comment?.Attachments?.length > 0 || isEditing) && "p-2")}
            disableAnimation={true}
            isPressable={isEditing} onPress={OnClickAddAttachment}>
            {isEditing ? (
              <div className={"flex flex-row justify-between w-full"}>
                {isDragActive ? <span className={"text-xs text-gray-500"}>Drop the files here ...</span> :
                  <span
                    className={"text-xs text-gray-500"}>Attach files by dragging & dropping, or clicking here</span>}
                <IconPaperclip size={15} className={"text-gray-500"} />
              </div>
            ) : (
              editedComment?.Attachments?.length > 0 &&
              <div className={"flex flex-row gap-1"}>
                <IconPaperclip size={15} className={"text-gray-500"} />
                <span className={"text-xs text-gray-500"}>{editedComment?.Attachments?.length} file(s) attached</span>
              </div>
            )}
            <div className={"flex gap-2 flex-wrap"}>
              {editedComment?.Attachments?.map((attachment, index) => {
                  const url = attachment.id ? `${process.env.NEXT_PUBLIC_API_URL}/organizations/${editedComment?.OrganizationId}/blob/${attachment.id}` : URL.createObjectURL(attachment);
                  const downloadUrl = attachment.id ? `${url}?download=true` : url;
                  return <Attachment key={attachment.id || attachment.name}
                                     isNew={!attachment.id}
                                     name={attachment.name}
                                     size={attachment.size}
                                     type={attachment.type}
                                     isEditing={isEditing}
                                     openUrl={url}
                                     downloadUrl={downloadUrl}
                                     markedForDeletion={attachment.markedForDeletion || false}
                                     onRemove={() => {
                                       if (attachment.id) editedComment.Attachments[index].markedForDeletion = true;
                                       else {
                                         editedComment.Attachments.splice(index, 1);
                                         setEditedComment({ ...editedComment });
                                       }
                                     }}
                                     onRestore={() => {
                                       if (attachment.id) editedComment.Attachments[index].markedForDeletion = false;
                                     }}
                  />;
                }
              )}
            </div>
          </Card>
        </CardFooter>
      </Card>

      <div className={"flex gap-5 w-full justify-end"}>
        {comment?.id ? isEditing && <>
          <Button auto size={"sm"} variant={"light"} className={"font-medium"} color={"danger"}
                  onPress={() => setIsEditing(false)}>Cancel</Button>
          <Button auto size={"sm"} variant={"flat"} color={"success"} onPress={saveHandler} isLoading={isSaving}
                  className={"font-medium"}>{"Update"}</Button>
        </> : <Button auto size={"sm"} variant={"flat"} color={"success"} onPress={saveHandler} isLoading={isSaving}
                      className={"font-medium"}>{"Comment"}</Button>
        }
      </div>
    </div>
  );
}