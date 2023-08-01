import { ReactNode } from "react";
import AuthRedirectServer from "@/components/server/authRedirectServer";

export default function BlogLayout({
                                     children
                                   }: {
  children: ReactNode;
}) {
  return (
    <AuthRedirectServer redirectIf={"logged-out"} to={"/login"}>
      <section className="flex flex-col justify-center gap-4 flex-grow items-start w-full">
        <div className="flex max-w-lg text-center justify-center flex-grow">
          {children}
        </div>
      </section>
    </AuthRedirectServer>
  );
}