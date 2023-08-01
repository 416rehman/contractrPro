import React, { useEffect } from "react";
import { Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { Job } from "@/types";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { Button } from "@nextui-org/button";
import { IconCurrencyDollar, IconDotsVertical, IconTrash } from "@tabler/icons-react";
import JobStatusSelector from "@/components/jobStatusSelector";
import MemberSelector from "@/components/OrgMemberSelector";

const columns = [
  { name: "Name", uid: "name" },
  { name: "Description", uid: "description" },
  { name: "Start Date", uid: "startDate" },
  { name: "Due Date", uid: "dueDate" },
  { name: "Payout", uid: "payout" },
  { name: "Assigned To", uid: "assignedTo" },
  { name: "Status", uid: "status" }
];

type Props = {
  jobs: Job[];
  isEditing: boolean;
  onEntryChanged: (name: string, value: any, id: string) => void;
  onEntryDeleted: (id: string) => void;
}

/**
 * This is a table component for the Contracts page. It displays all the jobs in the contract.
 * It renders an extra row at the bottom for the user to enter a new job.
 * On typing in the empty row, a new empty row is created at the bottom.
 * Also has an action button to delete the row.
 * The empty row and actions are hidden in edit mode
 */
export default function ContractJobsTable({ jobs, isEditing, onEntryChanged, onEntryDeleted }: Props) {
  const [jobsData, setJobsData] = React.useState(jobs);
  useEffect(() => {
    setJobsData(jobs);
  }, [jobs]);

  const renderCell = (job: Job, columnKey: React.Key, editMode) => {
    const cellValue = job[columnKey as keyof Job];

    switch (columnKey) {
      case "name":
        return <Input aria-label={"Name"}
                      key={job.id} value={cellValue}
                      placeholder="Name" variant={"underlined"}
                      isReadOnly={!editMode}
                      size={"sm"}
                      classNames={{
                        inputWrapper: ["rounded-none"]
                      }}
                      onChange={(e) => onEntryChanged(columnKey, e.target.value, job.id)} />;
      case "description":
        return <Input aria-label={"Description"}
                      key={job.id} value={cellValue} placeholder="Description"
                      variant={"underlined"}
                      size={"sm"}
                      isReadOnly={!editMode}
                      onChange={(e) => onEntryChanged(columnKey, e.target.value, job.id)} />;
      case "startDate": {
        // if its a string, convert it to a date
        const asDate = typeof cellValue === "string" && new Date(cellValue).toISOString().slice(0, -1);
        return <Input aria-label={"Start Date"}
                      key={job.id} value={asDate || ""} type="datetime-local"
                      placeholder="2017-06-01T08:30"
                      variant={"underlined"}
                      size={"sm"}
                      isReadOnly={!editMode}
                      onChange={(e) => onEntryChanged(columnKey, e.target.value, job.id)} />;
      }

      case "dueDate": {
        // if its a string, convert it to a date
        const asDate = typeof cellValue === "string" && new Date(cellValue).toISOString().slice(0, -1);
        return <Input aria-label={"Due Date"}
                      key={job.id} value={asDate || ""} type="datetime-local"
                      placeholder="2017-06-01T08:30"
                      variant={"underlined"}
                      size={"sm"}
                      isReadOnly={!editMode}
                      onChange={(e) => onEntryChanged(columnKey, e.target.value, job.id)} />;
      }

      case "payout":
        return <Input aria-label={"Payout"}
                      key={job.id} value={cellValue} type="number" placeholder="Quantity"
                      variant={"underlined"}
                      size={"sm"}
                      isReadOnly={!editMode}
                      startContent={<IconCurrencyDollar />}
                      onChange={(e) => onEntryChanged(columnKey, e.target.value, job.id)} />;
      case "assignedTo":
        return <MemberSelector
          className={"px-2"}
          isDisabled={!isEditing}
          label={"Client"}
          inline={true}
          onMemberChange={(changedMembers) => {
            if (changedMembers.length > 0 && changedMembers[0]?.id) {
              onEntryChanged(columnKey, changedMembers?.map((member) => member.id), job.id);
            }
          }}
          selectedMemberIds={cellValue}
        />;
      case "status":
        const isTouched = columns.some((column) => {
          return !!job[column.uid];
        });

        return <div className="relative flex justify-end items-center gap-2">
          <JobStatusSelector value={cellValue} onChange={(value) => onEntryChanged(columnKey, value, job.id)} />
          {editMode && isTouched && <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <IconDotsVertical className="text-default-300" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu onAction={(key) => {
              if (key === "delete") {
                onEntryDeleted(job.id);
              }
            }}>
              <DropdownItem startContent={<IconTrash className={"text-default-500"} />}
                            key={"delete"}>Delete</DropdownItem>
            </DropdownMenu>
          </Dropdown>}
        </div>;
    }
  };

  const items = jobsData ? [...jobsData, { id: Math.random().toString(36).substring(7) }] : [{ id: Math.random().toString(36).substring(7) }];

  return ((
    <div className={"overflow-auto pointer-events-auto"}>
      <Table aria-label="Contract Jobs" removeWrapper={true} classNames={{
        table: isEditing ? [""] : ["pointer-events-none"]
      }}>
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={"start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            // if its the last item and we are not editing, don't render it
            if (item.id === items[items.length - 1].id && !isEditing) {
              return null;
            } else return <TableRow key={item?.id} className={"p-0"}>
              {(columnKey) => <TableCell className={"p-0"}>{renderCell(item, columnKey, isEditing)}</TableCell>}
            </TableRow>;
          })}
        </TableBody>
      </Table>
    </div>
  ));
}