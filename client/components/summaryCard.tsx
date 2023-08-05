"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/card";
import NextLink from "next/link";
import { ReactNode } from "react";

type Props = {
  value: number;
  title: string;
  icon: ReactNode;
  link: string;
  linkText: string;
}

/**
 * This summary card is used in the dashboard to display a summary of a particular metric - Takes the following props:
 * @param value
 * @param title
 * @param icon
 * @param link
 * @param linkText
 */
export default function SummaryCard({ value, title, icon, link, linkText }: Props) {
  return (
    <Card className={"border-1 border-default-200 w-fit h-fit"}>
      <CardHeader className={"px-4 py-2 flex flex-row justify-between w-full gap-2"}>
        <span className={"text-sm font-medium"}>{title}</span>
        {icon}
      </CardHeader>
      <CardBody className={"px-4 py-2 "}>
        <div className={"flex flex-col justify-center items-start w-full"}>
          <h3 className={"text-lg font-bold"}>{value}</h3>
          <NextLink href={link}>
            <span
              className={"text-xs font-md underline decoration-dotted underline-offset-2 text-default-500 hover:text-default-600"}>{linkText}</span>
          </NextLink>
        </div>
      </CardBody>
    </Card>
  );
}