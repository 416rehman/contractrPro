"use client";
import { useRouter } from "next/navigation";
import { deleteContractAndPersist, updateContractAndPersist, useContractsStore } from "@/services/contracts";
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
  IconPrinter,
  IconTrash
} from "@tabler/icons-react";
import clsx from "clsx";
import { useUserStore } from "@/services/user";
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@nextui-org/dropdown";
import OrganizationSelector from "@/components/organizationSelector";
import { Contract } from "@/types";
import { Divider } from "@nextui-org/divider";
import ClientSelector from "@/components/clientSelector";
import { Tooltip } from "@nextui-org/tooltip";
import moment from "moment";
import ContractJobsTable from "@/components/contractJobsTable";
import { Spacer } from "@nextui-org/spacer";
import ContractCommentSection from "@/components/contractCommentSection";

type Props = {
  id: string;
  className?: string;
}

/**
 * This is the main form for editing and or creating an Contract. The form receives the contract id as a prop.
 * If the contract id is undefined, the form will be in create mode. Otherwise, it will be in edit mode.
 * It handles communication with the API and updates the local state via the Contract service.
 */
export default function ContractForm({ id, className }: Props) {
  const router = useRouter();
  const [contract] = useContractsStore(state => [state.contracts.find((contract: any) => contract.id === id)]);
  const [editedContract, setEditedContract] = useState<Contract | null>(); // Save the edited contractEntries here

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
    setEditedContract(contract);
    setIsEditing(!contract);
  }, [contract]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedContract({ ...editedContract, [e.target.name]: e.target.value });
  };

  const onSaveHandler = async () => {
    // Save the edited contractEntries here
    setIsSaving(true);

    const result = await updateContractAndPersist(editedContract, currentOrg?.id);

    setIsEditing(!editedContract?.id);
    if (!editedContract?.id) {
      router.push(`/contracts/${result?.id}`);
    }

    setIsSaving(false);
  };

  const onCancelHandler = () => {
    if (editedContract?.id) {
      setIsEditing(!editedContract?.id);
      setEditedContract(contract);
    }
  };

  const onDeleteHandler = async () => {
    // Delete the contractEntries here
    setIsSaving(true);
    setIsEditing(false);
    await deleteContractAndPersist(editedContract, currentOrg?.id);
    setIsSaving(false);
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

  const onEntryChangedHandler = (name: string, value: any, id: string) => {
    if (!id) return;

    // if an entry with the given id does not exist, create a new entry
    if (!editedContract?.Jobs?.find((entry) => entry.id === id)) {
      setEditedContract((prev) => ({
        ...prev,
        Jobs: [...(prev?.Jobs || []), { id, [name]: value }]
      }));
    }
    // otherwise, update the entry with the given id
    else {
      setEditedContract((prev) => ({
        ...prev,
        Jobs: prev?.Jobs?.map((entry) => entry.id === id ? { ...entry, [name]: value } : entry)
      }));
    }
  };

  const onEntryDeleteHandler = (id: string) => {
    if (!id) return;

    setEditedContract((prev) => ({
      ...prev,
      Jobs: prev?.Jobs?.filter((entry) => entry.id !== id)
    }));
  };

  const exportAsCSV = () => {
    if (!editedContract.Jobs) return;

    // Generate comma separated headers
    const headers = "" + Object.keys(editedContract.Jobs[0]).join(",");

    // Generate comma separated values
    const values = editedContract.Jobs.map((job) => Object.values(job).join(",")).join("\n");

    // Create hidden element and click it to download
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(headers + "\n" + values));
    element.setAttribute("download", `${editedContract.name || "contract"}-jobs.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={clsx("flex flex-col flex-grow w-full", className)}>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop={"opaque"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete contract</ModalHeader>
              <ModalBody> Are you sure you want to delete this contract? </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={() => {
                  onDeleteHandler();
                  onClose();
                  setEditedContract(undefined);
                }}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className={"flex justify-center flex-col w-full"}>
        <Card shadow={"none"} className={"border-none w-full"}>
          <CardHeader className={"flex gap-2"}>
            <div className={"flex-grow flex italic flex-col gap-1 items-start"}>
              <span className={"text-xs text-default-500"}>{currentOrg?.id}</span>
              <span className={"text-xs text-default-500"}>{editedContract?.id}</span>
            </div>
            <div>
              {contract?.id && (
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
              <div className={"flex flex-row gap-4 flex-wrap"}>
                <Input label={"Name"} placeholder={"123456"} value={editedContract?.name}
                       className={"flex-grow w-auto"}
                       isReadOnly={!isEditing}
                       type={"text"}
                       startContent={<Icon123 className={"text-default-400"} size={"20"} />}
                       isRequired={true}
                       name={"name"} onChange={onChangeHandler}
                       variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
                <ClientSelector
                  className={"flex-grow"}
                  isDisabled={!isEditing}
                  label={"Client"}
                  onClientChange={(changedClients) => {
                    if (changedClients.length > 0 && changedClients[0]?.id) {
                      setEditedContract((prev) => ({ ...prev, ClientId: changedClients[0]?.id }));
                    }
                  }}
                  selectedClientIds={[editedContract?.ClientId]}
                />
              </div>
              <Textarea label={"Description"} placeholder={"This is an awesome contract!"}
                        className={"flex-grow w-auto"}
                        value={editedContract?.description}
                        isReadOnly={!isEditing} name={"description"} onChange={onChangeHandler}
                        variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
              <div className={"flex flex-row gap-4 flex-wrap"}>
                <Input label={"Date Issued"} placeholder={"31-12-2023"}
                       className={"flex-grow w-auto"}
                       value={editedContract?.startDate && new Date(editedContract?.startDate).toISOString().slice(0, -1)}
                       isReadOnly={!isEditing}
                       type={"datetime-local"} name={"issueDate"} onChange={onChangeHandler}
                       startContent={<IconCalendarStar className={"text-default-400"} size={"20"} />}
                       isRequired={true}
                       variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />

                <Input label={"Due Date"} placeholder={"31-12-2023"}
                       className={"flex-grow w-auto"}
                       value={editedContract?.dueDate && new Date(editedContract?.dueDate).toISOString().slice(0, -1)}
                       isReadOnly={!isEditing}
                       startContent={<IconCalendar className={"text-default-400"} size={"20"} />}
                       type={"datetime-local"} name={"dueDate"} onChange={onChangeHandler}
                       variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
              </div>
              <Divider />
              <ContractJobsTable jobs={editedContract?.Jobs} isEditing={isEditing}
                                 onEntryDeleted={onEntryDeleteHandler}
                                 onEntryChanged={onEntryChangedHandler} />
              <Divider />
              <div className={"flex flex-row gap-1 items-start flex-grow justify-between w-full"}>
                {contract?.createdAt && (
                  <Tooltip content={contract?.createdAt}>
                    <span className={"text-xs text-default-500"}>Created {moment(contract?.createdAt).fromNow()}</span>
                  </Tooltip>
                )}
                {contract?.updatedAt &&
                  <Tooltip content={contract?.updatedAt}>
                    <span className={"text-xs text-default-500"}>Updated {moment(contract?.updatedAt).fromNow()}</span>
                  </Tooltip>
                }
              </div>
            </form>
          </CardBody>
          <CardFooter className={"flex flex-col justify-between"}>
            <div className={"flex gap-2 justify-between items-start flex-grow print:hidden"}>
              {isEditing && contract?.id ? (
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
              {/*  if no contractEntries Id this is a new contractEntries */}
              {!contract?.id && (
                <Button variant={"flat"} onPress={onSaveHandler} isLoading={isSaving}
                        className={"text-default-800 font-medium hover:bg-primary-200"}
                        startContent={<IconDeviceFloppy />}>
                  Save
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
        {contract?.id && (
          <ContractCommentSection contract={contract} />
        )}
        <Spacer y={10} />
      </div>
    </div>
  );
}