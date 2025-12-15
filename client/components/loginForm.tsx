"use client";

import { CardFooter, Input } from "@heroui/react";
import { login } from "@/services/auth";
import { useState } from "react";
import { Divider } from "@heroui/divider";
import clsx from "clsx";

import { IconAt, IconEye, IconEyeClosed, IconLogin, IconMailFilled } from "@tabler/icons-react";
import { Button } from "@heroui/button";
import { useToastsStore } from "@/services/toast";
import { Link } from "@heroui/link";
import { Card, CardBody } from "@heroui/card";
import { useTranslation } from "@/utils/useTranslation";

export default function LoginForm(props: any) {
  const { t, tError } = useTranslation();
  const addToast = useToastsStore((state) => state.addToast);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    login(email, password).then(() => {
      addToast({
        id: "login",
        title: t("auth.logged_in_title"),
        message: t("auth.logged_in_message"),
        type: "success"
      });
    }).catch((err) => {
      // err.code comes from API, translate it
      const errorCode = err?.response?.data?.code || err?.code;
      addToast({
        id: "login",
        title: t("common.error"),
        message: errorCode ? tError(errorCode) : (err.message || t("errors.error.internal")),
        type: "error"
      });
    }).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <Card className={clsx("flex flex-col gap-4 p-3", props.className)} shadow={"none"}>
      <CardBody>
        <form onSubmit={onSubmit} className={"flex flex-col gap-2 w-full"}>
          <div className="flex flex-col w-full flex-wrap gap-4">
            <h1 className={"text-2xl font-bold"}>{t("auth.login_title")}</h1>
            <p className={"text-sm"}>{t("auth.login_subtitle")}</p>
            <Input label={t("auth.username_email_label")} placeholder={t("auth.username_email_placeholder")}
              endContent={<div className={"flex flex-row text-default-400"}><IconAt /><IconMailFilled /></div>}
              onChange={(e: any) => setEmail(e.target.value)} />
            <Input label={t("auth.password_label")} placeholder={t("auth.password_placeholder")}
              onChange={(e: any) => setPassword(e.target.value)}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <IconEye className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <IconEyeClosed className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
            />
            <Link href={"/forgot-password"} className={"text-sm"}>{t("auth.forgot_password")}</Link>
          </div>
          <Button type="submit" isLoading={isLoading} className={"font-medium"}
            startContent={<IconLogin className={"text-foreground-500"} />}>{t("common.login")}</Button>
        </form>
      </CardBody>
      <Divider />
      <CardFooter>
        <p className={"text-sm "}>
          {t("auth.no_account")} <Link href={"/signup"} className={"text-sm"}>{t("auth.register_now")}</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
