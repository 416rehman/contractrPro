import React, { ReactElement, useEffect } from "react";
import { getIconComponent } from "@/utils/mimetypes";
import { IconCircleFilled, IconDotsVertical, IconExternalLink, IconTrash, IconX } from "@tabler/icons-react";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import clsx from "clsx";
import { Tooltip } from "@heroui/tooltip";

type AttachmentProps = {
  "name": string,
  "size": number,
  "type": string,
  "openUrl": string,
  "downloadUrl": string,
  "markedForDeletion"?: boolean,
  onRemove?: () => void
  onRestore?: () => void
  isNew?: boolean
  isEditing?: boolean
}

/**
 * A component to display an attachment. Must show the filename, size, and type.
 * If the attachment is marked for deletion, it must be displayed with a line-through.
 * If the attachment is new, it must be displayed with a colored dot on the left side.
 * If the attachment is being edited, it must display a button to remove it.
 * On click, it must download the file.
 */
export default function Attachment({
  name,
  size,
  type,
  openUrl,
  downloadUrl,
  markedForDeletion,
  onRemove,
  onRestore,
  isNew,
  isEditing
}: AttachmentProps) {
  const [Icon, setIcon] = React.useState<ReactElement>();
  useEffect(() => {
    setIcon(getIconComponent(type));
  }, [type]);

  const onOpen = () => window.open(openUrl, "_blank");
  const onDownload = () => window.open(downloadUrl, "_self");

  const onAction = (action: React.Key) => {
    switch (action) {
      case "open":
        onOpen();
        break;
      case "delete":
        onRemove?.();
        break;
      case "restore":
        onRestore?.();
        break;
    }
  };

  return (
    <Card isPressable={!!openUrl} onClick={onDownload}
      className={clsx("flex flex-row items-center gap-2 border border-default-200 rounded-md p-1 hover:bg-default-100 min-w-[200px] max-w-[300px] justify-between")}>
      <div className="flex flex-row gap-2 items-center">
        <div className={"flex items-center justify-center w-10 h-10 rounded-md bg-default-100"}>
          {Icon && React.cloneElement(Icon as ReactElement<any>, { className: "text-default-500" })}
        </div>
        <div className={"flex flex-col items-start truncate"}>
          <p
            className={clsx("flex gap-1 items-center font-normal text-sm text-default-600 truncate max-w-[200px]", markedForDeletion && "line-through", isNew && "!text-default-900")}
            title={name}>
            {isNew && <Tooltip content={"This is a new attachment. Must save the comment."}><IconCircleFilled size={8}
              className={"text-danger-500"} /></Tooltip>}
            {name}
          </p>
          <p
            className={clsx("text-xs italic text-default-500", markedForDeletion && "line-through")}>{size / 1000} KB</p>
        </div>
      </div>
      {isEditing && (isNew ?
        (
          <Tooltip content={"Remove this attachment"}>
            <Button isIconOnly={true} variant={"light"} onPress={() => onRemove?.()}><IconX size={20}
              className={"text-default-500"} /></Button>
          </Tooltip>
        ) :
        (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly={true} variant={"light"}>
                <IconDotsVertical size={20} className={"text-default-500"} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Attachment Actions" onAction={onAction}>
              <DropdownItem key="open" startContent={<IconExternalLink size={20} className={"text-default-500"} />}
                description={"Open this file in a new tab"}>Open</DropdownItem>
              {markedForDeletion ? <DropdownItem key="restore" className="text-success" color="success"
                startContent={<IconTrash size={20} />}
                description={"Restore this file"}>Restore</DropdownItem> :
                (<DropdownItem key="delete" className="text-danger" color="danger"
                  startContent={<IconTrash size={20} />}
                  description={"Delete this file"}>Delete</DropdownItem>)}
            </DropdownMenu>
          </Dropdown>
        )
      )}


    </Card>
  );
}