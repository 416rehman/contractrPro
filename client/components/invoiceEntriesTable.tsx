import React from "react";
import { Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { InvoiceEntry } from "@/types";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { Button } from "@nextui-org/button";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";

const columns = [
  { name: "NAME", uid: "name" },
  { name: "DESC", uid: "description" },
  { name: "QTY", uid: "quantity" },
  { name: "COST", uid: "unitCost" },
  { name: "TOTAL", uid: "total" }
];

type Props = {
  invoiceEntries: InvoiceEntry[];
  isEditing: boolean;
  onEntryChanged: (name: string, value: any, id: string) => void;
  onEntryDeleted: (id: string) => void;
}

/**
 * This is a table component for the Invoices page. It displays all the invoice entries.
 * It renders an extra row at the bottom for the user to enter a new invoice entry in.
 * On typing in the empty row, a new empty row is created at the bottom.
 * Also has an action button to delete the invoice entry from the invoice.
 * The empty row and actions are hidden in edit mode
 */
export default function InvoiceEntriesTable({ invoiceEntries, isEditing, onEntryChanged, onEntryDeleted }: Props) {
  const renderCell = (invoiceEntry: InvoiceEntry, columnKey: React.Key, editMode) => {
    const cellValue = invoiceEntry[columnKey as keyof InvoiceEntry];

    switch (columnKey) {
      case "name":
        return <Input key={invoiceEntry.id} value={cellValue}
                      placeholder="Name" variant={"underlined"}
                      isReadOnly={!editMode}
                      size={"sm"}
                      classNames={{
                        inputWrapper: ["rounded-none"]
                      }}
                      onChange={(e) => onEntryChanged(columnKey, e.target.value, invoiceEntry.id)} />;
      case "description":
        return <Input key={invoiceEntry.id} value={cellValue} placeholder="Description"
                      variant={"underlined"}
                      size={"sm"}
                      isReadOnly={!editMode}
                      onChange={(e) => onEntryChanged(columnKey, e.target.value, invoiceEntry.id)} />;
      case "quantity":
        return <Input key={invoiceEntry.id} value={cellValue} type="number" placeholder="Quantity"
                      variant={"underlined"}
                      size={"sm"}
                      isReadOnly={!editMode}
                      onChange={(e) => onEntryChanged(columnKey, e.target.value, invoiceEntry.id)} />;
      case "unitCost":
        return <Input key={invoiceEntry.id} value={cellValue} type="number" placeholder="Unit Cost"
                      className={"font-medium"}
                      variant={"underlined"}
                      size={"sm"}
                      isReadOnly={!editMode}
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">$</span>
                        </div>
                      }
                      onChange={(e) => onEntryChanged(columnKey, e.target.value, invoiceEntry.id)} />;
      case "total":
        const qtyValueAsNumber = Number(invoiceEntry["quantity"]);
        const costValue = Number(invoiceEntry["unitCost"]);
        const totalValue = qtyValueAsNumber * costValue;
        return totalValue ?
          <div className="relative flex justify-end items-center gap-2">
            <span className={"flex-grow font-medium text-tiny"}><span
              className="text-default-400 text-small">$</span>{totalValue.toFixed(2)}</span>
            {editMode ? <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <IconDotsVertical className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu onAction={(key) => {
                if (key === "delete") {
                  onEntryDeleted(invoiceEntry.id);
                }
              }}>
                <DropdownItem startContent={<IconTrash className={"text-default-500"} />}
                              key={"delete"}>Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown> : null}
          </div> : null;
    }
  };

  const items = invoiceEntries ? [...invoiceEntries, { id: Math.random().toString(36).substring(7) }] : [{ id: Math.random().toString(36).substring(7) }];
  return ((
    <div>
      <Table aria-label="Invoice Entries" removeWrapper={true}>
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