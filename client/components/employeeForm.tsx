"use client";
import { deleteEmployee, updateEmployee, useEmployeesStore } from "@/services/employees";
import {
  CardFooter,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from "@nextui-org/react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Icon123, IconAbc, IconMail, IconPhone } from '@tabler/icons-react';
import { useEffect, useState } from "react";
import { Button, ButtonGroup } from "@nextui-org/button";
import { IconChevronDown, IconDeviceFloppy, IconEdit, IconTrash } from "@tabler/icons-react";
import clsx from "clsx";
import { useUserStore } from "@/services/user";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import OrganizationSelector from "@/components/organizationSelector";
import { Tooltip } from "@nextui-org/tooltip";
import moment from "moment";

type Props = {
  id: string,
  className?: string,
}

/**
 * The EmployeeForm component renders a form for the user to input the name, phone, email, and permissions when creating an employee for a selected organization
 * (otherwise it will prompt them to join or create one). When they click on the save button, the created employee will be added to the employees list in their account
 * for them to look at in its own page, showing two buttons beside it: Edit (lets them update the employee's data) and Delete in a dropdown button (deletes the employee's data with a
 * confirmation).
 */
export default function EmployeeForm({ id, className }: Props) {
  const [employee] = useEmployeesStore(state => [state.employees.find((employee: any) => employee.id === id)]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<any>(); // Save the edited employee here
  const currentOrg = useUserStore(state => state.currentOrganization);
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
    setEditedEmployee(employee);
    setIsEditing(!employee);
  }, [employee]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedEmployee({ ...editedEmployee, [e.target.name]: e.target.value });
  };

  const onSaveHandler = async () => {
    // Save the edited employee here
    setIsSaving(true);

    await updateEmployee(editedEmployee, currentOrg?.id);

    setIsEditing(!editedEmployee?.id);
    if (!editedEmployee?.id) {
      setEditedEmployee(undefined);
    }

    setIsSaving(false);
  };

  const onDeleteHandler = async () => {
    // Delete the employee here
    setIsSaving(true);
    setIsEditing(false);
    await deleteEmployee(editedEmployee, currentOrg?.id);
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
              <ModalHeader className="flex flex-col gap-1">Delete employee</ModalHeader>
              <ModalBody> Are you sure you want to delete this employee? </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={() => {
                  onDeleteHandler();
                  onClose();
                  setEditedEmployee(undefined);
                }}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className={"flex justify-center w-full"}>
        <Card shadow={"none"} className={"border-none w-full"}>
          <CardHeader className={"flex gap-2"}>
            <div className={"flex-grow flex italic flex-col gap-1 items-start"}>
              <span className={"text-xs text-default-500"}>{currentOrg?.id}</span>
              <span className={"text-xs text-default-500"}>{editedEmployee?.id}</span>
            </div>
            <div>
              {employee?.id && (
                <ButtonGroup variant="flat" size={"sm"} color={"default"}>
                  <Button endContent={<IconEdit />}
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
                    <DropdownMenu>
                      <DropdownItem key={"delete"} description={"Delete this employee"} onPress={onOpen}
                                    startContent={<IconTrash className={"text-default-500"} />} shortcut={"D"}>
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </ButtonGroup>
              )}
            </div>
          </CardHeader>
          <CardBody className={"flex flex-col gap-4"}>
            <form className={clsx("flex flex-col gap-4", { "pointer-events-none": !isEditing })}>
              
              <Input label={"Name"} placeholder={"John Doe"} value={editedEmployee?.name} isReadOnly={!isEditing}
                     type={"text"}
                     startContent={<IconAbc className={"text-default-400"} size={"20"} />} 
                     name={"name"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
              <Input label={"Phone"} placeholder={"1-111-222-3333"} value={editedEmployee?.phone} isReadOnly={!isEditing}
                     type={"text"} 
                     startContent={<IconPhone className={"text-default-400"} size={"20"} />}
                     name={"phone"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
              <Input label={"Email"} placeholder={"johndoe@email.com"} value={editedEmployee?.email} isReadOnly={!isEditing}
                     type={"email"} 
                     startContent={<IconMail className={"text-default-400"} size={"20"} />}
                     name={"email"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
              <Input label={"Permissions"} placeholder={"5"} value={editedEmployee?.permissions} isReadOnly={!isEditing} 
                     type={"number"} 
                     startContent={<Icon123 className={"text-default-400"} size={"20"} />}
                     name={"permissions"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
            </form>
            <div className={"flex flex-col gap-1 items-start"}>
              {employee?.updatedAt &&
                <Tooltip content={employee?.updatedAt}>
                  <span className={"text-xs text-default-500"}>Updated {moment(employee?.updatedAt).fromNow()}</span>
                </Tooltip>
              }
              {employee?.createdAt && (
                <Tooltip content={employee?.createdAt}>
                  <span className={"text-xs text-default-500"}>Created {moment(employee?.createdAt).fromNow()}</span>
                </Tooltip>
              )}
            </div>
          </CardBody>
          <CardFooter>
            <div className={"flex gap-2 justify-between flex-grow"}>
              {isEditing && employee?.id ? (
                <>
                  <Button variant={"light"} onPress={() => setIsEditing(false)} color={"danger"}
                          className={"font-medium hover:bg-danger-200"}>
                    Cancel
                  </Button>
                  <Button variant={"flat"} onPress={onSaveHandler} loading={isSaving}
                          className={"text-default-800 font-medium hover:bg-primary-200"}
                          endContent={<IconDeviceFloppy />}>
                    Save
                  </Button>
                </>
              ) : null}
              {/*  if no employee Id this is a new employee */}
              {!employee?.id && (
                <Button variant={"flat"} onPress={onSaveHandler} loading={isSaving}
                        className={"text-default-800 font-medium hover:bg-primary-200"}
                        endContent={<IconDeviceFloppy />}>
                  Save
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );


}