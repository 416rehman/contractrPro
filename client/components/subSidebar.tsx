"use client";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {CardFooter, Input} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import {IconChevronDown, IconCirclePlus, IconDevicesDollar, IconListSearch, IconX} from "@tabler/icons-react";
import {Dispatch, EffectCallback, SetStateAction, useEffect, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@nextui-org/popover";
import {usePathname} from "next/navigation";

type Props = {
    className?: string;
    items?: React.ReactNode[];
    title?: string;
    newItemUrl?: string;
    filter: string;
    setFilter?: Dispatch<SetStateAction<string>>;
};

/**
 * This is the sidebar for the expenses page. It displays a list of expenses and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the expense service.
 * This is used in tandem with the expenseForm component to edit/create expenses.
 */
export default function SubSidebar({className, items, title, filter, setFilter, newItemUrl}: Props) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const pathname = usePathname();

    // Whenever the pathname changes, if the dropdown is open, close it
    useEffect(() => {
        if (isDropdownOpen) {
            setIsDropdownOpen(false);
        }
    }, [pathname]);

    const sidebar = <Card shadow={"none"} isBlurred={true}
                          className={clsx("border-none rounded-none", className)}>
        <CardHeader className={"flex flex-col gap-2"}>
            <h1 className={"text-2xl font-bold"}>{title}s</h1>
            {/*  Search bar*/}
            <Input aria-label={"Filter items"}
                   placeholder={"Filter"} size={"sm"} startContent={<IconListSearch className={"text-default-400"}/>}
                   variant={"underlined"}
                   onChange={(e) => setFilter(e.target.value)}
                   onClear={() => setFilter("")}
                   value={filter}
                   isClearable={true}
            />

        </CardHeader>
        <CardBody className={"p-2"}>
            <ul className={"flex flex-col w-full"}>
                {items}
            </ul>
        </CardBody>
        <CardFooter>
            <Button variant={"ghost"} className={"flex-grow"} href={newItemUrl} as={NextLink}
                    startContent={<IconCirclePlus className={"text-default-500"}/>}>
                New {title}
            </Button>
        </CardFooter>
    </Card>;

    // for mobile version have a dropdown
    const dropdown = <Popover isOpen={isDropdownOpen} onOpenChange={(isOpen) => setIsDropdownOpen(isOpen)}>
        <PopoverTrigger className={clsx("w-full flex md:hidden", className)}>
            <Button variant={"ghost"} className={""} endContent={isDropdownOpen ? <IconX/> : <IconChevronDown/>}>
                {title}s
            </Button>
        </PopoverTrigger>
        <PopoverContent className={"rounded-md !w-[94vw] !h-[85vh] p-1"}>
            {sidebar}
        </PopoverContent>
    </Popover>;

    return <>
        <div className={"hidden md:flex md:flex-col md:gap-2 md:w-1/4"}>
            {sidebar}
        </div>
        <div className={"flex md:hidden"}>
            {dropdown}
        </div>
    </>;
}