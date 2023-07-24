import React from "react";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";

export enum EJobStatus {
  OPEN,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED
}

const colorClasses = {
  [EJobStatus.OPEN]: "text-blue-500",
  [EJobStatus.IN_PROGRESS]: "text-yellow-500",
  [EJobStatus.COMPLETED]: "text-green-500",
  [EJobStatus.CANCELLED]: "text-red-500"
};

type Props = {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Dropdown for selecting the type of job status
 * Shows colored text depending on the status
 */
export default function JobStatusDropdown({ value, onChange }: Props) {
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));

  const selectedValue = React.useMemo(
    () => EJobStatus[Array.from(selectedKeys)[0]],
    [selectedKeys]
  );

  React.useEffect(() => {
    setSelectedKeys(new Set([value]));
  }, [value]);

  // onChange is called when the user selects a new value
  const onSelectionChange = React.useCallback(
    (keys) => {
      const key = [...keys][0];
      onChange(key);
      setSelectedKeys(keys);
    }, [onChange]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="bordered"
          size={"sm"}
          className={`capitalize w-full !${colorClasses[Array.from(selectedKeys)[0]]} font-medium`}
        >
          {selectedValue?.replace("_", " ")}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Single selection actions"
        variant="flat"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
      >
        {
          Object.values(EJobStatus).filter(status => !isNaN(Number(status))).map(status => <DropdownItem
            className={`${colorClasses[status]}`}
            key={status}>{EJobStatus[status].replace("_", " ")}</DropdownItem>)
        }
      </DropdownMenu>
    </Dropdown>
  );
}