"use client";

import { Input } from "@nextui-org/react";
import { signup } from "@/services/auth";
import { useState } from "react";
import { Divider } from "@nextui-org/divider";
import clsx from "clsx";
import { IconAt, IconEye, IconEyeClosed, IconLogin, IconMailFilled } from "@tabler/icons-react";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { useToastsStore } from "@/state/toasts";


export default function SignupComponent(props: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [isInProcess, setIsInProcess] = useState(false);
  const addToast = useToastsStore(state => state.addToast);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setIsInProcess(true);
    signup(email, password, username).then(() => {
      addToast({
        id: "signup",
        title: "Success",
        message: "You have successfully signed up!",
        type: "success"
      });
    }).catch((err) => {
      addToast({
        id: "signup",
        title: "Error",
        message: err.message || err || "An error occurred while signing up",
        type: "error"
      });
    }).finally(() => {
      setIsInProcess(false);
    });
  };

  return (
    <div className={clsx(props.className)}>
      <form onSubmit={onSubmit} className={"flex flex-col gap-2 w-full"}>
        <div className="flex flex-col w-full flex-wrap gap-4">

          <Input label="Username" placeholder="Enter your username"
                 endContent={<IconAt className={"text-default-400"} />}
                 onChange={(e: any) => setUsername(e.target.value)} maxLength={32} />
          <Input label="Email" placeholder="Enter your email" type="email"
                 endContent={<IconMailFilled className={"text-default-400"} />}
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
        <p className={"text-sm text-default-600"}>
          Already have an account? <Link href={"/login"} className={"text-sm"}>Login</Link>
        </p>
        <Button type="submit" isLoading={isInProcess} className={"font-medium"}
                startContent={<IconLogin className={"text-foreground-500"} />}>
          Sign up
        </Button>
      </form>
    </div>
  );
}