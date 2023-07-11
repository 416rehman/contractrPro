"use client";
import SignupComponent from "@/components/signup";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/state/user";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const user = useUserStore(state => state.user);

  useEffect(() => {
    if (user?.id) {
      router.push("/");
    }
  }, [router, user]);
  return (
    <SignupComponent className={"flex flex-col items-center justify-center w-full max-w-md mx-auto"} />
  );
}