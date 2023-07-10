"use client";

import { Input } from "@nextui-org/react";
import { signup } from "@/services/auth";
import { useState } from "react";
import { Divider } from "@nextui-org/divider";
import clsx from "clsx";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { Button } from "@nextui-org/button";

export default function SignupComponent(props: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={clsx(props.className)}>
      <form onSubmit={async (e: any) => {
        setIsLoading(true);
        e.preventDefault();
        await signup(email, password, username);
        setIsLoading(false);
      }} className={"flex flex-col gap-2 w-full"}>
        <div className="flex flex-col w-full flex-wrap gap-4">

          <Input label="Username" placeholder="Enter your username"
                 onChange={(e: any) => setUsername(e.target.value)} maxLength={32} />
          <Input label="Email" placeholder="Enter your email" type="email"
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
        <Button type="submit" isLoading={isLoading}>Sign up</Button>
      </form>
    </div>
  );
}