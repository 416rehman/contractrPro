"use client";

import { CardFooter, Input } from "@nextui-org/react";
import { signup } from "@/services/auth";
import { useState } from "react";
import { Divider } from "@nextui-org/divider";
import clsx from "clsx";
import { IconAt, IconEye, IconEyeClosed, IconLogin, IconMailFilled } from "@tabler/icons-react";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { useToastsStore } from "@/state/toasts";
import { Card, CardBody } from "@nextui-org/card";


export default function SignupComponent(props: any) {
  const [phone, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToastsStore(state => state.addToast);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    signup(phone, password, username).then(() => {
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
      setIsLoading(false);

    });
  };

  return (
    <Card className={clsx("flex flex-col gap-4 p-3", props.className)} shadow={"none"}>
      <CardBody>
        <form onSubmit={onSubmit} className={"flex flex-col gap-5 w-full"}>
          <div className="flex flex-col w-full flex-wrap gap-4">
            <h1 className={"text-2xl font-bold"}>Sign Up</h1>
            <p className={"text-md"}>Let{"'"}s get you started with an account</p>
            <Input label="Username" placeholder="Enter your username"
                   endContent={<IconAt className={"text-default-400"} />}
                   onChange={(e: any) => setUsername(e.target.value)} maxLength={32} />
            <Input label="Email" placeholder="Enter your phone" type="phone"
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
          <div className="flex flex-col gap-3 w-full">
            <p className={"text-sm text-default-600"}>
              Forgot your password? <Link href={"forgot-password"} className={"text-sm"}>Reset</Link>
            </p>
            <Button type="submit" isLoading={isLoading} className={"font-medium hover:bg-default-200"}
                    startContent={<IconLogin className={"text-foreground-500"} />}>
              Sign up
            </Button>
            <p className={"text-sm"}>By signing up, you agree to our <Link href={"/terms"} className={"text-sm"}>Terms
              of Service</Link> and <Link href={"/privacy"} className={"text-sm"}>Privacy Policy</Link>
            </p>
          </div>
        </form>
      </CardBody>
      <Divider />
      <CardFooter>
        <p className={"text-sm text-default-600"}>
          Already have an account? <Link href={"login"} className={"text-sm"}>Login</Link>
        </p>
      </CardFooter>
    </Card>
  );
}