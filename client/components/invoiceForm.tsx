"use client";
import { useRouter } from "next/navigation";
import { deleteInvoiceAndPersist, updateInvoiceAndPersist, useInvoicesStore } from "@/services/invoices";
import {
  CardFooter,
  Chip,
  cn,
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
import React, { useCallback, useEffect, useState } from "react";
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
import { Client, Invoice } from "@/types";
import InvoiceEntriesTable from "@/components/invoiceEntriesTable";
import { Divider } from "@nextui-org/divider";
import ClientSelector from "@/components/clientSelector";
import { Tooltip } from "@nextui-org/tooltip";
import moment from "moment";
import InvoiceCommentSection from "@/components/invoiceCommentSection";
import { Spacer } from "@nextui-org/spacer";
import { loadClients, useClientsStore } from "@/services/clients";
import { Checkbox } from "@nextui-org/checkbox";

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
  const [invoices] = useInvoicesStore(state => [state.invoices]);
  const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(); // Save the edited invoiceEntries here

  const clients = useClientsStore(state => state.clients);
  const [client, setClient] = useState<Client>(null);
  useEffect(() => {
    if (invoice?.BillToClientId) {
      setClient(clients.find((client: any) => client.id === invoice.BillToClientId));
    }
  }, [clients, invoice]);

  const currentOrg = useUserStore(state => state.currentOrganization);
  useEffect(() => {
    loadClients(currentOrg?.id);
  }, [currentOrg?.id]);

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

  const generateInvoiceNumber = useCallback(() => {
    const settings = currentOrg?.OrganizationSetting;
    if (settings?.invoiceUseDateForNumber) {
      let nextInvoiceNumber = "";
      const date = new Date();
      if (date) {
        // loop over all the invoices and find the highest integer parsed invoice number
        let parsedInvoiceNumber = null;
        const regexPattern = /^\d{8}(\d+)$/;
        invoices.forEach((invoice) => {
          const invoiceNumber = parseInt(invoice.invoiceNumber);
          if (!regexPattern.test(invoice.invoiceNumber)) {
            return;
          }

          if (isNaN(parsedInvoiceNumber) && !isNaN(invoiceNumber)) {
            parsedInvoiceNumber = invoiceNumber;
          } else if (invoiceNumber > parsedInvoiceNumber) {
            parsedInvoiceNumber = invoiceNumber;
          }
        });

        // if month is one digit, add a 0 in front of it
        const month = date.getMonth() + 1;
        const monthStr = month < 10 ? `0${month}` : `${month}`;
        // if day is one digit, add a 0 in front of it
        const day = date.getDate();
        const dayStr = day < 10 ? `0${day}` : `${day}`;

        if (isNaN(parsedInvoiceNumber)) {
          nextInvoiceNumber = `${date.getFullYear()}${monthStr}${dayStr}1`;
        } else {
          // get the last numbers in the invoice number
          const sequence = parseInt(
            `${parsedInvoiceNumber}`.match(regexPattern)?.[1]
          );
          if (isNaN(sequence)) {
            nextInvoiceNumber = `${date.getFullYear()}${monthStr}${dayStr}1`;
          } else {
            nextInvoiceNumber = `${date.getFullYear()}${monthStr}${dayStr}${
              sequence + 1
            }`;
          }
        }
      }

      return nextInvoiceNumber;
    }
    // find the most recent invoice number using the createdAt field
    const recentInvoice = invoices.reduce((prev, current) =>
      prev.createdAt > current.createdAt ? prev : current
    );
    const highestInvoiceNumber = recentInvoice.invoiceNumber;

    // if it can be parsed as an integer, parse it and increment it by 1
    // otherwise, add a 1 to the end of the string
    const regexPattern = /(\d+)$/;
    const match = highestInvoiceNumber.match(regexPattern);
    const sequence = parseInt(match?.[1]);
    const sequenceIndex = match?.index;

    if (!isNaN(sequence)) {
      return `${highestInvoiceNumber.substring(0, sequenceIndex)}${sequence + 1}`;
    } else {
      return `${highestInvoiceNumber}1`;
    }
  }, [currentOrg?.OrganizationSetting, invoices]);

  useEffect(() => {
    if (!invoice) {
      setEditedInvoice({
        invoiceNumber: generateInvoiceNumber(),
        issueDate: new Date(Date.now()).toISOString().slice(0, -1),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, -1)
      });
    } else {
      setEditedInvoice(invoice);
    }

    setIsEditing(!invoice);
  }, [generateInvoiceNumber, invoice]);

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

  const printView = () => {
    const subtotal = invoice?.InvoiceEntries?.reduce((prev, current) => prev + (current?.quantity * current?.unitCost), 0);
    const tax = subtotal * (invoice?.taxRate / 100);
    const total = subtotal + tax;
    return <div className={"flex-col w-full gap-10 tracking-wide hidden print:flex"}>
      <div id={"header"} className={"flex flex-col gap-10"}>
        <div className={"flex justify-between flex-row w-full"}>
          <div className={"flex flex-row gap-5 items-center"}>
            <img className={"w-[4rem] h-[4rem] object-cover rounded-md"}
                 src={currentOrg?.logoUrl || "/defaultImages/organizationDefault.png"} alt={"logo"}
            />
            <div className={"flex flex-col items-start"}>
              <p className={"text-sm"}>{currentOrg?.name}</p>
              <p className={"text-sm"}>{currentOrg?.Address?.addressLine1} {currentOrg?.Address?.addressLine2}</p>
              <p
                className={"text-sm"}>{currentOrg?.Address?.city}, {currentOrg?.Address?.province} {currentOrg?.Address?.postalCode}</p>
            </div>
          </div>
          <div className={"flex flex-col items-end"}>
            {invoice?.invoiceNumber && <p className={"text-sm"}>Invoice #: {invoice?.invoiceNumber}</p>}
            {invoice?.issueDate &&
              <p className={"text-sm"}>Issue Date: {invoice?.issueDate?.split("T")[0]}</p>}
          </div>
        </div>
        <div className={"flex flex-row w-full h-1 border-b-8 border-default-200"} />
      </div>
      <div id={"info"} className={"flex flex-row gap-5 justify-between"}>
        {client && (
          <div id={"billTo"} className={"flex flex-col gap-3 items-start"}>
            <p className={"font-medium"}>Bill To</p>
            <div className={"flex flex-col gap-2 items-start"}>
              <p className={"text-small text-left"}>
                {client?.name}<br />{client?.email}<br />{client?.phone}
              </p>
              {client?.Address && (<>
                <p className={"text-small"}>
                  {client?.Address?.addressLine1} {client?.Address?.addressLine2}<br />{client?.Address?.city} {client?.Address?.province} {client?.Address?.postalCode}<br />{client?.Address?.country}
                </p>
              </>)}
            </div>
          </div>
        )}
        <div id={"terms"} className={"flex flex-col gap-3 items-start"}>
          <p className={"font-medium"}>Terms</p>
          <div className={"flex flex-col gap-2 items-start"}>
            <p
              className={"text-small text-left"}>Due: {invoice?.dueDate?.split("T")[0]}<br />{currentOrg?.OrganizationSetting?.invoiceDefaultTerms}
            </p>
          </div>
        </div>
      </div>
      <div id={"entries"} className={"flex flex-col gap-5"}>
        <table className={"w-full border-separate border-spacing-0 bg-default-100 rounded-md"}>
          <thead>
          <tr className={"border-b-2 border-default-200"}>
            <th className={"text-left font-normal p-2 border-b-2 border-default text-small"}>Description</th>
            <th className={"text-left font-normal p-2 border-b-2 border-default text-small"}>Quantity</th>
            <th className={"text-left font-normal p-2 border-b-2 border-default text-small"}>Unit Cost</th>
            <th className={"text-left font-normal p-2 border-b-2 border-default text-small"}>Amount</th>
          </tr>
          </thead>
          <tbody>
          {invoice?.InvoiceEntries?.map((entry) => (
            <tr key={entry.id}>
              <td className={"text-left px-2 pb-1 border-b-1 border-default"}>
                <div className={"flex flex-col items-start"}>
                  <p>{entry?.name}</p>
                  <p className={"text-small font-thin text-default-700"}>{entry?.description}</p>
                </div>
              </td>
              <td className={"text-left text-small px-2 py-1 border-b-1 border-default"}>{entry.quantity}</td>
              <td
                className={"text-left text-small px-2 py-1 border-b-1 border-default"}>{currentOrg?.OrganizationSetting?.currencySymbol || "$"}{entry?.unitCost}</td>
              <td
                className={"text-left text-small px-2 py-1 border-b-1 border-default"}>{currentOrg?.OrganizationSetting?.currencySymbol || "$"}{entry?.unitCost * entry?.quantity}</td>
            </tr>
          ))}
          <tr>
            <td className={"text-left px-2 pt-2 border-t-2 border-default text-small"}>
              Subtotal
            </td>
            <td className={"text-left px-2 pt-2 border-t-2 border-default"} />
            <td className={"text-left px-2 pt-2 border-t-2 border-default"} />
            <td className={"text-left px-2 pt-2 border-t-2 border-default text-small font-medium"}>
              {currentOrg?.OrganizationSetting?.currencySymbol || "$"}{subtotal}
            </td>
          </tr>
          <tr>
            <td className={"text-left px-2 pb-2 border-default text-small"}>
              Tax ({invoice?.taxRate}%)
            </td>
            <td className={"text-left px-2 pb-2 border-default"} />
            <td className={"text-left px-2 pb-2 border-default"} />
            <td className={"text-left px-2 pb-2 border-default text-small font-medium"}>
              {currentOrg?.OrganizationSetting?.currencySymbol || "$"}{tax}
            </td>
          </tr>
          <tr>
            <td className={"text-left px-2 py-2 border-y-3 border-default font-medium"}>
              Total
            </td>
            <td className={"text-left px-2 py-2 border-y-3 border-default"} />
            <td className={"text-left px-2 py-2 border-y-3 border-default"} />
            <td className={"text-left px-2 py-2 border-y-3 border-default font-medium"}>
              {currentOrg?.OrganizationSetting?.currencySymbol || "$"}{total}
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div id={"notes"} className={"flex flex-col gap-3 items-start flex-grow"}>
        <p className={"font-medium"}>Notes</p>
        <div className={"flex flex-col gap-2 items-start"}>
          <p className={"text-small text-left italic"}>{invoice?.note}</p>
        </div>
      </div>
      <div id={"footer"} className={"flex flex-col gap-3 items-start"}>
        <p className={clsx("text-small", { "font-medium": currentOrg?.OrganizationSetting?.invoiceBoldFooterLine1 })}>
          {currentOrg?.OrganizationSetting?.invoiceFooterLine1}
        </p>
        <p className={clsx("text-small", { "font-medium": currentOrg?.OrganizationSetting?.invoiceBoldFooterLine2 })}>
          {currentOrg?.OrganizationSetting?.invoiceFooterLine2}
        </p>
      </div>
    </div>;
  };

  return (
    <>
      {printView()}
      <div className={clsx("flex-col flex-grow w-full flex print:hidden", className)}>
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
                          <DropdownItem key={"print"} onPress={() => window.print()}
                                        description={"'Save as PDF' or print this Contract"}
                                        startContent={<IconPrinter className={"text-default-500"} />} shortcut={"P"}>
                            Print
                          </DropdownItem>
                          <DropdownItem key={"export"} description={"Export in CSV file format"}
                                        onPress={() => exportAsCSV()}
                                        startContent={<IconFileTypeCsv className={"text-default-500"} />}
                                        shortcut={"E"}>
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
                <div className={"flex flex-row gap-4 flex-wrap items-center justify-start"}>
                  <ClientSelector
                    isDisabled={!isEditing}
                    label={"Bill to Client"}
                    className={"w-full lg:w-1/2"}
                    onClientChange={(changedClients) => {
                      if (changedClients.length > 0 && changedClients[0]?.id) {
                        setEditedInvoice((prev) => ({ ...prev, BillToClientId: changedClients[0]?.id }));
                      }
                    }}
                    selectedClientIds={[editedInvoice?.BillToClientId]}
                  />
                  {invoice?.id && (
                    <>
                      <Checkbox color={"secondary"} isSelected={!!editedInvoice?.paymentDate}
                                classNames={{
                                  base: cn(
                                    "inline-flex w-full max-w-md bg-content1",
                                    "hover:bg-content2 items-center justify-start",
                                    "cursor-pointer rounded-lg gap-2 p-2 border-2 border-transparent"
                                  ),
                                  label: "w-full"
                                }}
                                onValueChange={() => {
                                  if (editedInvoice?.paymentDate) {
                                    setEditedInvoice((prev) => ({ ...prev, paymentDate: null }));
                                  } else {
                                    setEditedInvoice((prev) => ({
                                      ...prev,
                                      paymentDate: new Date().toISOString().slice(0, -1)
                                    }));
                                  }
                                }}>
                        <div className="flex flex-col gap-1">
                          <span className="text-tiny text-default-500">Payment Status</span>
                          <Chip color={editedInvoice?.paymentDate ? "success" : "danger"} size="sm" variant="flat">
                            {editedInvoice?.paymentDate ? `Paid on ${moment(editedInvoice?.paymentDate).format("ll")}` : "Unpaid"}
                          </Chip>
                        </div>
                      </Checkbox>
                    </>
                  )}
                </div>

                <div className={"flex flex-row gap-4 flex-wrap lg:flex-nowrap"}>
                  <Input label={"Invoice #"} placeholder={"123456"}
                         className={"w-full lg:w-1/4"}
                         value={editedInvoice?.invoiceNumber}
                         isReadOnly={!isEditing}
                         type={"text"}
                         startContent={<Icon123 className={"text-default-400"} size={"20"} />}
                         isRequired={true}
                         name={"invoiceNumber"} onChange={onChangeHandler}
                         variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
                  <Input label={"PO Number"} placeholder={"This is for your use"} value={editedInvoice?.poNumber}
                         className={"w-full lg:w-1/4"}
                         isReadOnly={!isEditing}
                         type={"text"} name={"poNumber"} onChange={onChangeHandler}
                         startContent={<IconHash className={"text-default-400"} size={"20"} />}
                         variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />

                </div>
                <div className={"flex flex-row gap-4 flex-wrap lg:flex-nowrap"}>
                  <Input label={"Date Issued"} placeholder={"31-12-2023"}
                         value={(editedInvoice?.issueDate && new Date(editedInvoice?.issueDate).toISOString().slice(0, -1))}
                         className={"w-full lg:w-1/4"}
                         isReadOnly={!isEditing}
                         type={"datetime-local"} name={"issueDate"} onChange={onChangeHandler}
                         startContent={<IconCalendarStar className={"text-default-400"} size={"20"} />}
                         isRequired={true}
                         variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
                  <Input label={"Due Date"} placeholder={"31-12-2023"}
                         value={(editedInvoice?.dueDate && new Date(editedInvoice?.dueDate).toISOString().slice(0, -1))}
                         className={"w-full lg:w-1/4"}
                         startContent={<IconCalendar className={"text-default-400"} size={"20"} />}
                         type={"datetime-local"} name={"dueDate"} onChange={onChangeHandler}
                         variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
                </div>
                <InvoiceEntriesTable invoiceEntries={editedInvoice?.InvoiceEntries} isEditing={isEditing}
                                     onEntryDeleted={onEntryDeleteHandler}
                                     onEntryChanged={onEntryChangedHandler} />
                <div className={"flex flex-row gap-4 justify-between"}>
                  <Input label={"Tax Rate"} placeholder={"13"}
                         value={editedInvoice?.taxRate || (!editedInvoice?.id && currentOrg?.OrganizationSetting?.invoiceDefaultTaxRate)}
                         className={"w-fit"}
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
                    <Button variant={"flat"} onPress={onSaveHandler} isLoading={isSaving}
                            className={"text-default-800 font-medium hover:bg-primary-200"}
                            startContent={<IconDeviceFloppy />}>
                      Save
                    </Button>
                  </>
                ) : null}
                {/*  if no invoiceEntries Id this is a new invoiceEntries */}
                {!invoice?.id && (
                  <Button variant={"flat"} onPress={onSaveHandler} isLoading={isSaving}
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
          <Spacer y={10} className={"print:hidden"} />
        </div>
      </div>
    </>
  );
}