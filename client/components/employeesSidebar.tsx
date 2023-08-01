"use client";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { CardFooter, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import { IconAt, IconChevronDown, IconListSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadEmployees, useEmployeesStore } from "@/services/employees";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";

type Props = {
  className?: string;
}

/**
 * This is the sidebar for the employees page. It displays a list of employees and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the Employee service.
 * This is used in tandem with the EmployeeForm component to edit/create employees.
 * TODO: Implement filtering
 */
export default function EmployeesSidebar({ className }: Props) {
  const [currentOrg] = useUserStore(state => [state.currentOrganization]);
  const [employees] = useEmployeesStore(state => [state.employees]);
  const [filter, setFilter] = useState("");
  const params = useParams();

  useEffect(() => {
    loadEmployees(currentOrg?.id);
  }, [currentOrg?.id]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    employees.filter((item: any) => item.name.toLowerCase().includes(e.target.value.toLowerCase()));
  };

  const sidebar = <Card shadow={"none"} isBlurred={true}
                        className={clsx("border-none rounded-none", className)}>
    <CardHeader className={"flex flex-col gap-2"}>
      <h1 className={"text-2xl font-bold"}>Employees</h1>
      {/*  Search bar*/}
      <Input placeholder={"Filter"} size={"sm"} endContent={<IconListSearch className={"text-default-400"} />}
             variant={"underlined"}
             onChange={handleFilterChange} />
    </CardHeader>
    <CardBody className={"p-2"}>
      <ul className={"flex flex-col w-full"}>
        {employees && employees.map((employee) => (
          <li key={employee.id}>
            <Button
              className={"w-full justify-start text-default-600 font-medium"}
              as={NextLink}
              href={"/employees/" + employee?.id}
              startContent={<IconAt className={"text-default-300"} size={"20"} />}
              variant={params.id === employee?.id ? "flat" : "light"}
              size={"sm"}>
              <span className={"truncate"}>{employee?.name}</span>
            </Button>
          </li>
        ))}
      </ul>
    </CardBody>
    <CardFooter>
      <Button variant={"ghost"} className={"flex-grow"} href={"/employees/new"} as={NextLink}>
        Create New Employee
      </Button>
    </CardFooter>
  </Card>;

  // for mobile version have a dropdown
  const dropdown = <Popover className={className}>
    <PopoverTrigger className={"w-full flex md:hidden"}>
      <Button variant={"ghost"} className={""} endContent={<IconChevronDown />}>
        Employees
      </Button>
    </PopoverTrigger>
    <PopoverContent className={"rounded-md !w-[94vw] !h-[85vh] p-1"}>
      {sidebar}
    </PopoverContent>
  </Popover>;

  return <>
    <div className={"hidden md:flex md:flex-col md:gap-2 md:min-w-1/4"}>
      {sidebar}
    </div>
    <div className={"flex md:hidden"}>
      {dropdown}
    </div>
  </>;
}
