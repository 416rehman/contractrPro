"use client";

import { CardFooter, Input } from "@nextui-org/react";
import { login } from "@/services/auth";
import { useState } from "react";
import { Divider } from "@nextui-org/divider";
import clsx from "clsx";

import { IconAt, IconEye, IconEyeClosed, IconLogin, IconMailFilled } from "@tabler/icons-react";
import { Button } from "@nextui-org/button";
import { useToastsStore } from "@/services/toast";
import { Link } from "@nextui-org/link";
import { Card, CardBody } from "@nextui-org/card";

export default function LoginComponent(props: any) {
  const addToast = useToastsStore((state) => state.addToast);
  const [phone, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    login(phone, password).then(() => {
      addToast({
        id: "login",
        title: "Logged in",
        message: "You have been logged in successfully",
        type: "success"
      });
    }).catch((err) => {
      addToast({
        id: "login",
        title: "Error",
        message: err.message || err || "An error occurred while logging in",
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
            <h1 className={"text-2xl font-bold"}>Login</h1>
            <p className={"text-sm"}>Enter your credentials to login to your account</p>
            <Input label="Username / Email" placeholder="Enter your phone or username"
                   endContent={<div className={"flex flex-row text-default-400"}><IconAt />/<IconMailFilled /></div>}
                   onChange={(e: any) => setEmail(e.target.value)} />
            <Input label="Password" placeholder="Enter your password"
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
          </div>
          <Button type="submit" isLoading={isLoading} className={"font-medium"}
                  startContent={<IconLogin className={"text-foreground-500"} />}>Login</Button>
        </form>
      </CardBody>
      <Divider />
      <CardFooter>
        <p className={"text-sm "}>
          Don{"'"}t have an account? <Link href={"/signup"} className={"text-sm"}>Register</Link> now!
        </p>
      </CardFooter>
    </Card>
  );
}