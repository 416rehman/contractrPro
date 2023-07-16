"use client";

import { IconTriangleInvertedFilled } from '@tabler/icons-react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { Item } from '@/types';

type Props = {
    name: string,
    items: Array<Item>,
    className?: string,
}

export function DropdownSelect({name, items, className}: Props) {

    return (
        <div className={className}>
            <Dropdown className={className}>
                <DropdownTrigger>
                    <Button size={"lg"} endContent={<IconTriangleInvertedFilled width={16} height={16}/>}>
                        {name}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Dynamic Actions" items={items} onAction={(key) => console.log("TODO: Add an action when selecting an item")}>
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


