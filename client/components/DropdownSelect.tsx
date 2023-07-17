"use client";

import { IconTriangleInvertedFilled } from '@tabler/icons-react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { Item } from '@/types';
import { useMemo, useState } from 'react';
import { useToastsStore } from '@/services/toast';

type Props = {
    items: Array<Item>,
    className?: string,
}

export function DropdownSelect({items, className}: Props) {

    const toastsStore = useToastsStore(state => state);

    const [selectedItems, setSelectedItems] = useState(new Set([`${items[0].name}`]));

    const selectedValue = useMemo(
      () => Array.from(selectedItems).join(", ").replaceAll("_", " "),
      [selectedItems]
    );
    
    const selectedAction = () => {
        console.log("TODO: Select Action");
        toastsStore.addToast({
          id: "select-action",
          title: "Select Action",
          message: "TODO: Not implemented yet",
          type: "error"
        });
    }

    return (
        <div className={className}>
            <Dropdown>
                <DropdownTrigger>
                    <Button size={"lg"} endContent={<IconTriangleInvertedFilled width={12} height={12} />}>
                        {selectedValue}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu 
                    aria-label="Single Selection Actions"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={selectedItems}
                    onSelectionChange={setSelectedItems}
                    items={items}
                    onAction={() => selectedAction()}
                >
                    {items.map((item) => (
                        <DropdownItem key={item.key} >
                            {item.name}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}


