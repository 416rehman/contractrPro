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
            (type === "success" ? " bg-success-tr-50 text-green-700 " :
              type === "info" ? " bg-info-tr-50 text-info-500 " :
                type === "error" ? " bg-error-tr-50 text-error-500" :
                  type === "warning" ? " bg-warning-tr-50 text-warning-500" : "")}
    >
      <CardBody className={"flex flex-row p-0 gap-4 w-full"}>
        {icon()}
        <div className={"flex flex-col justify-center w-full"}>
          {title && (
            <p className={"text-sm font-semibold"}>{title}</p>
          )}

          {message && (
            <p className={"text-sm font-normal text-foreground-500"}>{message}</p>
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