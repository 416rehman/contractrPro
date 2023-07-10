"use client";

import { Input } from "@nextui-org/react";
import { login } from "@/services/auth";
import { useState } from "react";
import { Divider } from "@nextui-org/divider";
import clsx from "clsx";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { Button } from "@nextui-org/button";

export default function LoginComponent(props: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={clsx(props.className)}>
      <form onSubmit={async (e: any) => {
        setIsLoading(true);
        e.preventDefault();
        await login(email, password);
        setIsLoading(false);
      }} className={"flex flex-col gap-2 w-full"}>
        <div className="flex flex-col w-full flex-wrap gap-4">
          <Input label="Username" placeholder="Enter your email or username"
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
        <Divider />
        <Button type="submit" isLoading={isLoading}>Login</Button>
      </form>
    </div>
  );
}