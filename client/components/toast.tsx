"use client";

import { ReactNode, useEffect, useState } from "react";
import { Card, CardBody } from "@nextui-org/card";
import { Progress } from "@nextui-org/progress";
import { Spacer } from "@nextui-org/spacer";
import {
  IconAlertTriangleFilled,
  IconBug,
  IconCircleCheckFilled,
  IconInfoCircleFilled,
  IconX
} from "@tabler/icons-react";
import { Button } from "@nextui-org/button";

export interface Toast {
  id: string;
  title?: string;
  type?: "info" | "success" | "error" | "warning";
  message?: string;
  durationInSecs?: number;
  body?: ReactNode;
  showDuration?: boolean;
  hideCloseButton?: boolean;
  onClose?: () => void;
  isPressable?: boolean;
  onPress?: () => void;
  endContent?: ReactNode;
  startContent?: ReactNode;
}

/**
 * A toast component that shows a message for a few seconds. It can be used to show a success, error, warning or info message.
 * It is used in tandem with the **ToastBox** component which occupies the bottom right corner of the screen and shows all the toasts.
 * The Toasts service can be used to add toasts from anywhere in the app.
 * - The **title** is shown in bold at the top of the toast.
 * - The **message** is shown below the title.
 * - The **type** determines the color of the toast. It can be "info", "success", "error" or "warning".
 * - The **durationInSecs** determines how long the toast is shown. It is 5 seconds by default.
 * - The **body** can be any ReactNode. It is shown below the message.
 * - The **showDuration** determines whether the duration progress bar is shown. It is true by default.
 * - The **hideCloseButton** determines whether the close button is shown. It is false by default.
 * - The **onClose** is called when the toast is closed.
 * - The **isPressable** determines whether the toast is pressable. It is false by default.
 * - The **onPress** is called when the toast is pressed.
 * - The **endContent** is shown at the end (right side) of the toast.
 * - The **startContent** is shown at the start (left side) of the toast.
 */
export default function Toast({
                                title,
                                type,
                                durationInSecs,
                                message,
                                body,
                                showDuration,
                                hideCloseButton,
                                onClose,
                                isPressable,
                                onPress
                              }: Toast) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const smoothingFactor = 10;
    const interval = setInterval(() => {
      if (!paused) {
        setCurrentProgress((prev) => prev + (100 / (durationInSecs * smoothingFactor)));
      }
    }, 1000 / smoothingFactor);

    return () => clearInterval(interval);
  }, [currentProgress, durationInSecs, paused]);

  useEffect(() => {
    if (currentProgress > 105) {
      onClose?.();
    }
  }, [currentProgress, onClose]);

  const icon = () => {
    switch (type) {
      case "success":
        return <IconCircleCheckFilled stroke={1.5} />;
      case "info":
        return <IconInfoCircleFilled stroke={1.5} />;
      case "error":
        return <IconBug stroke={1.5} />;
      case "warning":
        return <IconAlertTriangleFilled stroke={1.5} />;
      default:
        return null;
    }
  };

  return (
    <Card isPressable={isPressable} onPress={onPress} onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          shadow={"sm"}
          className={"px-5 py-3 rounded-md w-fit min-w-1/4 max-w-1/2 backdrop-blur-md " +
            (type === "success" ? " bg-mygreen-50 text-mygreen-500 " :
              type === "info" ? " bg-myblue-50 text-myblue-500" :
                type === "error" ? " bg-myred-50 text-myred-500" :
                  type === "warning" ? " bg-myorange-50 text-myorange-500" :
                    " bg-foreground-200 text-foreground-900")}
    >
      <CardBody className={"flex flex-row p-0 gap-4 w-full"}>
        {icon()}
        <div className={"flex flex-col justify-center w-full"}>
          {title && (
            <p className={"text-sm font-semibold"}>{title}</p>
          )}

          {message && (
            <p className={"text-sm font-normal text-foreground-900"}>{message}</p>
          )}

          {body}
        </div>
      </CardBody>
      {showDuration && (
        <>
          <Spacer y={1} />
          <Progress value={currentProgress} size={"sm"} color={"default"}
                    className={"w-full"} />
        </>
      )}
      {!hideCloseButton && (
        <Button isIconOnly className={"absolute top-1 right-1 p-0 m-0 text-foreground-500"} size={"sm"}
                variant={"light"} onPress={onClose}>
          <IconX stroke={3} size={"12"} />
        </Button>
      )}
    </Card>
  );
}