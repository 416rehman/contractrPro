"use client";
import { deleteExpense, updateExpenses, useExpensesStore } from "@/services/expenses";
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
  IconCalendarStar,
  IconChevronDown,
  IconDeviceFloppy,
  IconEdit,
  IconPercentage,
  IconPrinter,
  IconTrash
} from "@tabler/icons-react";
import clsx from "clsx";
import { useUserStore } from "@/services/user";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import OrganizationSelector from "@/components/organizationSelector";
import { Expense } from "@/types";
import ExpenseEntriesTable from "@/components/expenseEntriesTable";
import { Divider } from "@nextui-org/divider";
import VendorSelector from "@/components/vendorSelector";
import { Tooltip } from "@nextui-org/tooltip";
import moment from "moment";
import ExpenseCommentSection from "@/components/expenseCommentSection";

type Props = {
  id: string;
  className?: string;
}

/**
 * This is the main form for editing and or creating an Expense. The form receives the expense id as a prop.
 * If the expense id is undefined, the form will be in create mode. Otherwise, it will be in edit mode.
 * It handles communication with the API and updates the local state via the Expense service.
 */
export default function Expenseform({ id, className }: Props) {
  const [expense] = useExpensesStore(state => [state.expenses.find((expense: any) => expense.id === id)]);
  const [editedExpense, setEditedExpense] = useState<Expense | null>(); // Save the edited expenseEntries here

  const currentOrg = useUserStore(state => state.currentOrganization);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // For delete modal dialog
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    setEditedExpense(expense);
    setIsEditing(!expense);
  }, [expense]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedExpense({ ...editedExpense, [e.target.name]: e.target.value });
  };

  const onEntryChangedHandler = (name: string, value: any, id: string) => {
    if (!id) return;

    // if an entry with the given id does not exist, create a new entry
    if (!editedExpense?.ExpenseEntries?.find((entry) => entry.id === id)) {
      setEditedExpense((prev) => ({
        ...prev,
        ExpenseEntries: [...(prev?.ExpenseEntries || []), { id, [name]: value }]
      }));
    }
    // otherwise, update the entry with the given id
    else {
      setEditedExpense((prev) => ({
        ...prev,
        ExpenseEntries: prev?.ExpenseEntries?.map((entry) => entry.id === id ? { ...entry, [name]: value } : entry)
      }));
    }
  };

  const onEntryDeleteHandler = (id: string) => {
    if (!id) return;

    setEditedExpense((prev) => ({
      ...prev,
      ExpenseEntries: prev?.ExpenseEntries?.filter((entry) => entry.id !== id)
    }));
  };

  const onSaveHandler = async () => {
    // Save the edited ExpenseEntries here
    setIsSaving(true);

    await updateExpenses(editedExpense, currentOrg?.id);

    setIsEditing(!editedExpense?.id);
    if (!editedExpense?.id) {
      setEditedExpense(undefined);
    }

    setIsSaving(false);
  };

  const onCancelHandler = () => {
    if (editedExpense?.id) {
      setIsEditing(!editedExpense?.id);
      setEditedExpense(expense);
    }
  };

  const onDeleteHandler = async () => {
    // Delete the ExpenseEntries here
    setIsSaving(true);
    setIsEditing(false);
    await deleteExpense(editedExpense, currentOrg?.id);
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

  return (
    <div className={clsx("flex flex-col flex-grow w-full", className)}>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop={"opaque"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete expense</ModalHeader>
              <ModalBody> Are you sure you want to delete this expense? </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={() => {
                  onDeleteHandler();
                  onClose();
                  setEditedExpense(undefined);
                }}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className={"flex flex-col justify-center w-full"}>
        <Card shadow={"none"} className={"border-none w-full"}>
          <CardHeader className={"flex gap-2"}>
            <div className={"flex-grow flex italic flex-col gap-1 items-start"}>
              <span className={"text-xs text-default-500"}>{currentOrg?.id}</span>
              <span className={"text-xs text-default-500"}>{editedExpense?.id}</span>
            </div>
            <div>
              {expense?.id && (
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
                      <DropdownItem key={"print"} description={"Print this ExpenseEntries"} onPress={() => {
                        window.print();
                      }}
                                    startContent={<IconPrinter className={"text-default-500"} />} shortcut={"P"}>
                        Print
                      </DropdownItem>
                      <DropdownItem key={"delete"} description={"Delete this ExpenseEntries"} onPress={onOpen}
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

              <VendorSelector
                isDisabled={!isEditing}
                label={"Purchase from vendor"}
                onVendorChange={(changedVendors) => {
                  if (changedVendors.length > 0 && changedVendors[0]?.id) {
                    setEditedExpense((prev) => ({ ...prev, VendorId: changedVendors[0]?.id }));
                  }
                }}
                selectedVendorIds={[editedExpense?.VendorId]}
              />

              <div className={"flex flex-row gap-4"}>
                <Input label={"Expense #"} placeholder={"Expense number"} value={editedExpense?.expenseNumber}
                       startContent={<Icon123 className={"text-default-400"} size={"20"} />}
                       isReadOnly={!isEditing} name={"expenseNumber"} onChange={onChangeHandler}
                       isRequired={true}
                       variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />

                <Input label={"Date purchased"} placeholder={"31-12-2023"}
                       value={editedExpense?.date && new Date(editedExpense?.date).toISOString().slice(0, -1)}
                       isReadOnly={!isEditing}
                       type={"datetime-local"} name={"date"} onChange={onChangeHandler}
                       startContent={<IconCalendarStar className={"text-default-400"} size={"20"} />}
                       isRequired={true}
                       variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
              </div>
              <div className={"flex flex-row gap-4"}>
                <Textarea label={"Description"} placeholder={"Description"} value={editedExpense?.description}
                          isReadOnly={!isEditing} name={"description"} onChange={onChangeHandler}
                          variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              </div>
              <ExpenseEntriesTable expenseEntries={editedExpense?.ExpenseEntries} isEditing={isEditing}
                                   onEntryDeleted={onEntryDeleteHandler}
                                   onEntryChanged={onEntryChangedHandler} />
              <div className={"flex flex-row gap-4 justify-between"}>
                <Input label={"Tax Rate"} placeholder={"13"} value={editedExpense?.taxRate} className={"w-1/4"}
                       size={"sm"}
                       isReadOnly={!isEditing}
                       startContent={<IconPercentage className={"text-default-400"} size={"20"} />}
                       type={"number"} name={"taxRate"} onChange={onChangeHandler}
                       variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
                <div className={"flex flex-col gap-2 items-end"}>
                  <span className={"text-sm font-medium text-default-500"}>Subtotal: $<span
                    className={"text-default-800"}>{editedExpense?.ExpenseEntries?.reduce((acc, entry) => acc + entry.unitPrice * entry.quantity, 0)}</span></span>
                  <span className={"text-sm font-medium text-default-500"}>Tax: $<span
                    className={"text-default-800"}>{(editedExpense?.ExpenseEntries?.reduce((acc, entry) => acc + entry.unitPrice * entry.quantity, 0) * (editedExpense?.taxRate || 0) / 100).toFixed(2)}</span></span>
                  <span className={"text-medium font-medium text-default-500"}>Total: $<span
                    className={"text-default-800"}>{(editedExpense?.ExpenseEntries?.reduce((acc, entry) => acc + entry.unitPrice * entry.quantity, 0) * (1 + (editedExpense?.taxRate || 0) / 100)).toFixed(2)}</span></span>

                </div>
              </div>
              <Divider />
            </form>
          </CardBody>
          <CardFooter>
            <div className={"flex flex-col gap-1 items-start"}>
              {expense?.updatedAt &&
                <Tooltip content={expense?.updatedAt}>
                  <span className={"text-xs text-default-500"}>Updated {moment(expense?.updatedAt).fromNow()}</span>
                </Tooltip>
              }
              {expense?.createdAt && (
                <Tooltip content={expense?.createdAt}>
                  <span className={"text-xs text-default-500"}>Created {moment(expense?.createdAt).fromNow()}</span>
                </Tooltip>
              )}
            </div>
            <div className={"flex gap-2 justify-between flex-grow"}>
              {isEditing && expense?.id ? (
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
              {/*  if no ExpenseEntries Id this is a new ExpenseEntries */}
              {!expense?.id && (
                <Button variant={"flat"} onPress={onSaveHandler} isLoading={isSaving}
                        className={"text-default-800 font-medium hover:bg-primary-200"}
                        startContent={<IconDeviceFloppy />}>
                  Save
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
        {expense?.id && (
          <ExpenseCommentSection expense={expense} />
        )}
      </div>
    </div>
  );
}