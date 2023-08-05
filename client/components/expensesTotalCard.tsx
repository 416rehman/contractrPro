"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { IconDevicesDollar } from "@tabler/icons-react";
import NextLink from "next/link";
import { useEffect, useState } from "react";

type Props = {
  expensesTotal: number;
  changeSinceLastMonth: number;
}

/**
 * This card is used in the dashboard to display the total cost of all the expenses and a change from last month - Takes the following props:
 * @param expensesTotal
 * @param changeSinceLastMonth
 */
export default function ExpensesTotalCard({ expensesTotal, changeSinceLastMonth }: Props) {
  const [changeAsPercent, setChangeAsPercent] = useState<number>(0);
  useEffect(() => {
    setChangeAsPercent(changeSinceLastMonth / expensesTotal);
  }, [expensesTotal, changeSinceLastMonth]);

  return (
    <Card className={"border-1 border-default-200 w-fit h-fit"}>
      <CardHeader className={"px-4 py-2 flex flex-row justify-between w-full"}>
        <span className={"text-sm font-medium"}>Total Expenses</span>
        <IconDevicesDollar className={"text-default-500"} size={"20"} />
      </CardHeader>
      <CardBody className={"px-4 py-2 "}>
        <div className={"flex flex-col justify-center items-start w-full"}>
          <h3 className={"text-lg font-bold"}>${expensesTotal.toFixed(2)}</h3>
          <span className={"text-xs font-md"}>{changeAsPercent > 0 ? "+" : ""}{(changeAsPercent * 100).toFixed(1)}% from last month</span>
          <NextLink href={"/expenses"}>
            <span
              className={"text-xs font-md underline decoration-dotted underline-offset-2 text-default-500 hover:text-default-600"}>View Expenses</span>
          </NextLink>
        </div>
      </CardBody>
    </Card>
  );
}