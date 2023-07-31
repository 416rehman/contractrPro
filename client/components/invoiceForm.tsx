"use client";
import { useRouter } from "next/navigation";
import { deleteInvoiceAndPersist, updateInvoiceAndPersist, useInvoicesStore } from "@/services/invoices";
import {
  CardFooter,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure
} from "@nextui-org/react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import React, { useEffect, useState } from "react";
import { Button, ButtonGroup } from "@nextui-org/button";
import {
  Icon123,
  IconCalendar,
  IconCalendarStar,
  IconChevronDown,
  IconDeviceFloppy,
  IconEdit,
  IconFileTypeCsv,
  IconHash,
  IconPercentage,
  IconPrinter,
  IconTrash
} from "@tabler/icons-react";
import clsx from "clsx";
import { useUserStore } from "@/services/user";
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@nextui-org/dropdown";
import OrganizationSelector from "@/components/organizationSelector";
import { Invoice } from "@/types";
import InvoiceEntriesTable from "@/components/invoiceEntriesTable";
import { Divider } from "@nextui-org/divider";
import ClientSelector from "@/components/clientSelector";
import { Tooltip } from "@nextui-org/tooltip";
import moment from "moment";
import { InvoiceCommentSection } from "@/components/invoiceCommentSection";
import { Spacer } from "@nextui-org/spacer";

type Props = {
  id: string;
  className?: string;
}

/**
 * This is the main form for editing and or creating an Invoice. The form receives the invoice id as a prop.
 * If the invoice id is undefined, the form will be in create mode. Otherwise, it will be in edit mode.
 * It handles communication with the API and updates the local state via the Invoice service.
 */
export default function InvoiceForm({ id, className }: Props) {
  const router = useRouter();

  const [invoice] = useInvoicesStore(state => [state.invoices.find((invoice: any) => invoice.id === id)]);
  const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(); // Save the edited invoiceEntries here

  const currentOrg = useUserStore(state => state.currentOrganization);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Confirm reload if editing
  useEffect(() => {
    if (isEditing) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }
  }, [isEditing]);

  // For delete modal dialog
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    setEditedInvoice(invoice);
    setIsEditing(!invoice);
  }, [invoice]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedInvoice({ ...editedInvoice, [e.target.name]: e.target.value });
  };

  const onEntryChangedHandler = (name: string, value: any, id: string) => {
    if (!id) return;

    // if an entry with the given id does not exist, create a new entry
    if (!editedInvoice?.InvoiceEntries?.find((entry) => entry.id === id)) {
      setEditedInvoice((prev) => ({
        ...prev,
        InvoiceEntries: [...(prev?.InvoiceEntries || []), { id, [name]: value }]
      }));
    }
    // otherwise, update the entry with the given id
    else {
      setEditedInvoice((prev) => ({
        ...prev,
        InvoiceEntries: prev?.InvoiceEntries?.map((entry) => entry.id === id ? { ...entry, [name]: value } : entry)
      }));
    }
  };

  const onEntryDeleteHandler = (id: string) => {
    if (!id) return;

    setEditedInvoice((prev) => ({
      ...prev,
      InvoiceEntries: prev?.InvoiceEntries?.filter((entry) => entry.id !== id)
    }));
  };

  const onSaveHandler = async () => {
    // Save the edited invoiceEntries here
    setIsSaving(true);

    const result = await updateInvoiceAndPersist(editedInvoice, currentOrg?.id);

    setIsEditing(!editedInvoice?.id);
    if (!editedInvoice?.id) {
      // navigate to the new invoice
      router.push(`/invoices/${result?.id}`);
    }

    setIsSaving(false);
  };

  const onCancelHandler = () => {
    if (editedInvoice?.id) {
      setIsEditing(!editedInvoice?.id);
      setEditedInvoice(invoice);
    }
  };

  const onDeleteHandler = async () => {
    // Delete the invoiceEntries here
    setIsSaving(true);
    setIsEditing(false);
    await deleteInvoiceAndPersist(editedInvoice, currentOrg?.id);
    setIsSaving(false);
  };

  const exportAsCSV = () => {
    if (!editedInvoice.InvoiceEntries) return;

    // Generate comma separated headers
    const headers = "" + Object.keys(editedInvoice.InvoiceEntries[0]).join(",");

    // Generate comma separated values
    const values = editedInvoice.InvoiceEntries.map((job) => Object.values(job).join(",")).join("\n");

    // Create hidden element and click it to download
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(headers + "\n" + values));
    element.setAttribute("download", `${editedInvoice.id + "-invoice" || "invoice"}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!currentOrg) {
    return <div className={clsx("flex flex-col flex-grow w-full", className)}>
      <div className={"flex justify-center w-full"}>
        <Card shadow={"none"} className={"border-none w-full"}>
          <CardHeader className={"flex gap-2 justify-center flex-col"}>
            <p className={"text-xl"}>Please select an organization</p>
            <OrganizationSelector hideActions={true} />
          </CardHeader>
        </Card>
      </div>
    </div>;
  }

  return (
    <div className={clsx("flex flex-col flex-grow w-full", className)}>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop={"opaque"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete invoice</ModalHeader>
              <ModalBody> Are you sure you want to delete this invoice? </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={() => {
                  onDeleteHandler();
                  onClose();
                  setEditedInvoice(undefined);
                }}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className={"flex flex-col justify-center w-full gap-5"}>
        <Card shadow={"none"} className={"border-none w-full"}>
          <CardHeader className={"flex gap-2"}>
            <div className={"flex-grow flex italic flex-col gap-1 items-start"}>
              <span className={"text-xs text-default-500"}>{currentOrg?.id}</span>
              <span className={"text-xs text-default-500"}>{editedInvoice?.id}</span>
            </div>
            <div>
              {invoice?.id && (
                <ButtonGroup variant="flat" size={"sm"} color={"default"} className={"print:hidden"}>
                  <Button startContent={<IconEdit />}
                          onPress={() => setIsEditing(true)}
                          isDisabled={isEditing}>
                    Edit
                  </Button>
                  <Dropdown placement="bottom-start">
                    <DropdownTrigger>
                      <Button isIconOnly>
                        <IconChevronDown />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu className={"print:hidden"}>
                      <DropdownSection title={"Actions"} showDivider={true}>
                        <DropdownItem key={"print"} description={"Print this Contract"} onPress={() => {
                          window.print();
                        }}
                                      startContent={<IconPrinter className={"text-default-500"} />} shortcut={"P"}>
                          Print
                        </DropdownItem>
                        <DropdownItem key={"export"} description={"Export in CSV file format"}
                                      onPress={() => exportAsCSV()}
                                      startContent={<IconFileTypeCsv className={"text-default-500"} />} shortcut={"E"}>
                          Export
                        </DropdownItem>
                      </DropdownSection>
                      <DropdownItem key={"delete"} description={"Delete this Contract"} onPress={onOpen}
                                    className={"text-danger-500"}
                                    startContent={<IconTrash className={"text-default-500"} />} shortcut={"D"}>
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </ButtonGroup>
              )}
            </div>
          </CardHeader>
          <CardBody className={"flex flex-col gap-4 printable"}>
            <form className={clsx("flex flex-col gap-4", { "pointer-events-none": !isEditing })}>

              <ClientSelector
                isDisabled={!isEditing}
                label={"Bill to Client"}
                onClientChange={(changedClients) => {
                  if (changedClients.length > 0 && changedClients[0]?.id) {
                    setEditedInvoice((prev) => ({ ...prev, BillToClientId: changedClients[0]?.id }));
                  }
                }}
                selectedClientIds={[editedInvoice?.BillToClientId]}
              />

              <div className={"flex flex-row gap-4 flex-wrap lg:flex-nowrap"}>
                <Input label={"Invoice #"} placeholder={"123456"} value={editedInvoice?.invoiceNumber}
                       isReadOnly={!isEditing}
                       type={"text"}
                       startContent={<Icon123 className={"text-default-400"} size={"20"} />}
                       isRequired={true}
                       name={"invoiceNumber"} onChange={onChangeHandler}
                       variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
                <Input label={"Date Issued"} placeholder={"31-12-2023"}
                       value={editedInvoice?.issueDate && new Date(editedInvoice?.issueDate).toISOString().slice(0, -1)}
                       isReadOnly={!isEditing}
                       type={"datetime-local"} name={"issueDate"} onChange={onChangeHandler}
                       startContent={<IconCalendarStar className={"text-default-400"} size={"20"} />}
                       isRequired={true}
                       variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
              </div>
              <div className={"flex flex-row gap-4"}>
                <Input label={"Due Date"} placeholder={"31-12-2023"}
                       value={editedInvoice?.dueDate && new Date(editedInvoice?.dueDate).toISOString().slice(0, -1)}
                       isReadOnly={!isEditing}
                       startContent={<IconCalendar className={"text-default-400"} size={"20"} />}
                       type={"datetime-local"} name={"dueDate"} onChange={onChangeHandler}
                       variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
                <Input label={"PO Number"} placeholder={"This is for your use"} value={editedInvoice?.poNumber}
                       isReadOnly={!isEditing}
                       type={"text"} name={"poNumber"} onChange={onChangeHandler}
                       startContent={<IconHash className={"text-default-400"} size={"20"} />}
                       variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
              </div>
              <InvoiceEntriesTable invoiceEntries={editedInvoice?.InvoiceEntries} isEditing={isEditing}
                                   onEntryDeleted={onEntryDeleteHandler}
                                   onEntryChanged={onEntryChangedHandler} />
              <div className={"flex flex-row gap-4 justify-between"}>
                <Input label={"Tax Rate"} placeholder={"13"} value={editedInvoice?.taxRate} className={"w-1/4"}
                       size={"sm"}
                       isReadOnly={!isEditing}
                       startContent={<IconPercentage className={"text-default-400"} size={"20"} />}
                       type={"number"} name={"taxRate"} onChange={onChangeHandler}
                       variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
                <div className={"flex flex-col gap-2 items-end"}>
                  <span className={"text-sm font-medium text-default-500"}>Subtotal: $<span
                    className={"text-default-800"}>{editedInvoice?.InvoiceEntries?.reduce((acc, entry) => acc + entry.unitCost * entry.quantity, 0)}</span></span>
                  <span className={"text-sm font-medium text-default-500"}>Tax: $<span
                    className={"text-default-800"}>{(editedInvoice?.InvoiceEntries?.reduce((acc, entry) => acc + entry.unitCost * entry.quantity, 0) * (editedInvoice?.taxRate || 0) / 100).toFixed(2)}</span></span>
                  <span className={"text-medium font-medium text-default-500"}>Total: $<span
                    className={"text-default-800"}>{(editedInvoice?.InvoiceEntries?.reduce((acc, entry) => acc + entry.unitCost * entry.quantity, 0) * (1 + (editedInvoice?.taxRate || 0) / 100)).toFixed(2)}</span></span>

                </div>
              </div>
              <Divider />
              <Textarea label={"Note"} placeholder={"This is a customer facing note."} value={editedInvoice?.note}
                        isReadOnly={!isEditing} name={"note"} onChange={onChangeHandler}
                        variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
            </form>
          </CardBody>
          <CardFooter>
            <div className={"flex flex-col gap-1 items-start"}>
              {invoice?.updatedAt &&
                <Tooltip content={invoice?.updatedAt}>
                  <span className={"text-xs text-default-500"}>Updated {moment(invoice?.updatedAt).fromNow()}</span>
                </Tooltip>
              }
              {invoice?.createdAt && (
                <Tooltip content={invoice?.createdAt}>
                  <span className={"text-xs text-default-500"}>Created {moment(invoice?.createdAt).fromNow()}</span>
                </Tooltip>
              )}
            </div>
            <div className={"flex gap-2 justify-between flex-grow"}>
              {isEditing && invoice?.id ? (
                <>
                  <Button variant={"light"} onPress={onCancelHandler} color={"danger"}
                          className={"font-medium hover:bg-danger-200"}>
                    Cancel
                  </Button>
                  <Button variant={"flat"} onPress={onSaveHandler} loading={isSaving}
                          className={"text-default-800 font-medium hover:bg-primary-200"}
                          startContent={<IconDeviceFloppy />}>
                    Save
                  </Button>
                </>
              ) : null}
              {/*  if no invoiceEntries Id this is a new invoiceEntries */}
              {!invoice?.id && (
                <Button variant={"flat"} onPress={onSaveHandler} loading={isSaving}
                        className={"text-default-800 font-medium hover:bg-primary-200"}
                        startContent={<IconDeviceFloppy />}>
                  Save
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
        {invoice?.id && (
          <InvoiceCommentSection invoice={invoice} />
        )}
        <Spacer y={10} />
      </div>
    </div>
  );
}