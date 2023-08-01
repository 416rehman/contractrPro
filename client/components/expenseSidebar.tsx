"use client";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { CardFooter, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import { IconBuilding, IconChevronDown, IconListSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadExpenses,useExpensesStore } from "@/services/expenses";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";

type Props = {
  className?: string;
}

/**
 * This is the sidebar for the expenses page. It displays a list of expenses and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the expense service.
 * This is used in tandem with the expenseForm component to edit/create expenses.
 * TODO: Implement filtering
 */
export default function ExpenseSidebar({ className }: Props) {
  const [currentOrg] = useUserStore(state => [state.currentOrganization]);
  const [expenses] = useExpensesStore(state => [state.expenses]);
  const [filter, setFilter] = useState("");
  const params = useParams();

  useEffect(() => {
    loadExpenses(currentOrg?.id);
  }, [currentOrg?.id]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    expenses.filter((item: any) => item.name.toLowerCase().includes(e.target.value.toLowerCase()));
  };

  const sidebar = <Card shadow={"none"} isBlurred={true}
                        className={clsx("border-none rounded-none", className)}>
    <CardHeader className={"flex flex-col gap-2"}>
      <h1 className={"text-2xl font-bold"}>Expenses</h1>
      {/*  Search bar*/}
      <Input aria-label={"Filter expenses"}
             placeholder={"Filter"} size={"sm"} endContent={<IconListSearch className={"text-default-400"} />}
             variant={"underlined"}
             onChange={handleFilterChange} />
    </CardHeader>
    <CardBody className={"p-2"}>
      <ul className={"flex flex-col w-full"}>
        {expenses && expenses.map((expense) => (
          <li key={expense.id}>
            <Button
              className={"w-full justify-start text-default-600 font-medium"}
              as={NextLink}
              href={"/expenses/" + expense?.id}
              startContent={<IconBuilding className={"text-default-300"} size={"20"} />}
              variant={params.id === expense?.id ? "flat" : "light"}
              size={"sm"}>
              <span className={"truncate"}>{expense?.expenseNumber}</span>
            </Button>
          </li>
        ))}
      </ul>
    </CardBody>
    <CardFooter>
      <Button variant={"ghost"} className={"flex-grow"} href={"/expenses/new"} as={NextLink}>
        Create New Expense
      </Button>
    </CardFooter>
  </Card>;

  // for mobile version have a dropdown
  const dropdown = <Popover>
    <PopoverTrigger className={clsx("w-full flex md:hidden", className)}>
      <Button variant={"ghost"} className={""} endContent={<IconChevronDown />}>
      Expenses
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