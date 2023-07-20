import React, { useEffect, useRef, useState } from "react";
import { Dropdown, DropdownItem, DropdownItemProps, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { Card, Input } from "@nextui-org/react";
import clsx from "clsx";

type Props = {
  items: React.ReactElement<DropdownItemProps>[];
  selectionMode: "single" | "multiple";
  onSelectionChange?: (selectedIds: Set<string>) => void;
  trigger: React.ReactElement;
  onQueryChange?: (query: string) => void;
  selectedKeys?: Set<string>;
  label?: string;
  isReadOnly?: boolean;
}

// Shows an input if typing
export default function SearchInput({
                                      items,
                                      selectionMode,
                                      onSelectionChange,
                                      trigger,
                                      onQueryChange,
                                      selectedKeys,
                                      label,
                                      isReadOnly
                                    }: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (onQueryChange) {
      onQueryChange(query);
    }
  }, [onQueryChange, query]);

  const inputRef = useRef(null);

  const list = [
    <DropdownItem key="search" closeOnSelect={false} onClick={() => {
      inputRef.current.focus();
    }} textValue={"search"}>
      <Input aria-label="Search"
             placeholder="Search" onChange={(e) => setQuery(e.target.value)} ref={inputRef} size={"xs"}
             className={"w-full rounded-md WTF"} />
    </DropdownItem>,
    ...items
  ];

  const selectionChangeHandler = (selectedKeys: Set<string>) => {
    // dont select the search item
    if (selectedKeys.has("search")) {
      selectedKeys.delete("search");
      if (selectionMode === "single") {
        return;
      }
    }

    onSelectionChange?.(selectedKeys);
  };

  return (
    <div>
      <Dropdown triggerScaleOnOpen={false} isOpen={isOpen} onOpenChange={setIsOpen}>
        <DropdownTrigger>
          <label className={"label flex flex-col gap-2"}>
            <span>{label}</span>
            <Card shadow={"none"} isPressable={true} onPress={() => setIsOpen(true)}
                  className={clsx("bg-default-100 border-2 border-default-200 flex flex-col items-start justify-start p-2 group-data-[focus=true]:border-foreground", isReadOnly ? "bg-transparent" : "bg-default-100")}>
              {trigger}
            </Card>
          </label>
        </DropdownTrigger>
        <DropdownMenu onSelectionChange={selectionChangeHandler} selectionMode={selectionMode}
                      selectedKeys={selectedKeys}>
          {list}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}