"use client";
import LoginComponent from "@/components/login";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "@/state/user";

export default function LoginPage() {
  const router = useRouter();
  const user = useUserStore(state => state.user);

  useEffect(() => {
    if (user?.id) {
      router.push("/");
    }
  }, [router, user]);

  return (
    <LoginComponent className={"flex flex-col items-center justify-center w-full max-w-md mx-auto"} />
  );
}