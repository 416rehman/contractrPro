import LoginComponent from "@/components/login";
import AuthRedirect from "@/components/authRedirect";

export const metadata = {
  title: "Log In"
};

export default function LoginPage() {
  return (
    <AuthRedirect redirectIf={"logged-in"} to={"/"}>
      <LoginComponent className={"flex flex-col items-center justify-center w-full max-w-md mx-auto"} />
    </AuthRedirect>
  );
}