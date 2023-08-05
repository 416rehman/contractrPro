"use client";

import { Spinner } from "@nextui-org/spinner";
import { Divider } from "@nextui-org/divider";
import * as React from "react";

type Props = {
  label?: string;
}

/**
 * The default loading spinner used throughout the application and is used as the main loading indicator for pages.
 * This is a simple wrapper around the NextUI Spinner component and is kept minimal for ease of use.
 */
export function LoadingSpinner({ label }: Props) {
  return (
    <div className="flex max-w-lg text-center justify-center gap-4 flex-col text-foreground-500 w-full h-full">
      <Spinner label={label || "Loading..."} color={"primary"} />
      <Divider />
      <h3 className="text-tiny font-medium">If this takes longer than 20 seconds, please refresh the page.</h3>
    </div>
  );
}