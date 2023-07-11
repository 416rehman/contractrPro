import { title } from "@/components/primitives";
import AuthRedirect from "@/components/authRedirect";
import JobScreen from "@/components/jobScreen";

export default function AboutPage() {
  return (
    <AuthRedirect redirectIf="logged-out" to={"/login"}>
      <JobScreen />
      <section className="flex flex-col flex-grow gap-4 py-8 h-full" id={"contracts"}>
        <h1 className={title()}>Contracts</h1>
      </section>
    </AuthRedirect>
  );
}