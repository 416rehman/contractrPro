"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { IconReceipt2 } from "@tabler/icons-react";
import NextLink from "next/link";
import { useEffect, useState } from "react";

type Props = {
  invoicesTotal: number;
  changeSinceLastMonth: number;
}

/**
 * This card is used in the dashboard to display the total cost of all the invoices and a change from last month - Takes the following props:
 * @param invoicesTotal
 * @param changeSinceLastMonth
 * @constructor
 */
export default function InvoicesTotalCard({ invoicesTotal, changeSinceLastMonth }: Props) {
  const [changeAsPercent, setChangeAsPercent] = useState<number>(0);
  useEffect(() => {
    setChangeAsPercent(changeSinceLastMonth / invoicesTotal);
  }, [invoicesTotal, changeSinceLastMonth]);

  return (
    <Card className={"border-1 border-default-200 w-fit h-fit"}>
      <CardHeader className={"px-4 py-2 flex flex-row justify-between w-full"}>
        <span className={"text-sm font-medium"}>Total Invoices</span>
        <IconReceipt2 className={"text-default-500"} size={"20"} />
      </CardHeader>
      <CardBody className={"px-4 py-2 "}>
        <div className={"flex flex-col justify-center items-start w-full"}>
          <h3 className={"text-lg font-bold"}>${invoicesTotal.toFixed(2)}</h3>
          {
            changeSinceLastMonth > 0 ?
              <span className={"text-xs font-md"}>{changeAsPercent > 0 ? "+" : ""}{(changeAsPercent * 100).toFixed(1)}% from last month</span>
              : <span className={"text-xs font-md"}>No change from last month</span>
          }
          <NextLink href={"/invoices"}>
            <span
              className={"text-xs font-md underline decoration-dotted underline-offset-2 text-default-500 hover:text-default-600"}>View Invoices</span>
          </NextLink>
        </div>
      </CardBody>
    </Card>
  );
}