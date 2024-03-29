import SignupForm from "@/components/signupForm";
import AuthRedirectServer from "@/components/server/authRedirectServer";

export const metadata = {
  title: "Sign Up | ContractrPro",
  description: "Sign up for an account"
};


export default function LoginPage() {
  return (
    <>
      <AuthRedirectServer redirectIf={"logged-in"} to={"/"}>
        <div className={"flex flex-col items-center justify-center w-full h-full"}>
          <SignupForm className={"flex flex-col items-center justify-center w-full max-w-md"} />
        </div>
      </AuthRedirectServer>
    </>
  );
}