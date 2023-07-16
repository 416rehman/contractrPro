"use client";

import { IconTriangleInvertedFilled } from '@tabler/icons-react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { Item } from '@/types';
import { useToastsStore } from '@/services/toast';

type Props = {
    name: string,
    items: Array<Item>,
    className?: string,
}

export function DropdownSelect({name, items, className}: Props) {

    const toastsStore = useToastsStore(state => state);

    const selectAction = () => {
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
                    <Button size={"lg"} endContent={<IconTriangleInvertedFilled width={12} height={12}/>}>
                        {name}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Dynamic Actions" items={items} onAction={() => selectAction()}>
                    {items.map((item) => (
                        <DropdownItem key={item.itemKey}>
                            {item.itemLabel}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </div>
        
    );
}


