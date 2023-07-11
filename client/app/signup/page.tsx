import SignupComponent from "@/components/signup";

import AuthRedirect from "@/components/authRedirect";

export const metadata = {
  title: "Sign Up",
  description: "Sign up for an account"
};


export default function LoginPage() {
  const router = useRouter();
  const user = useUserStore(state => state.user);

  useEffect(() => {
    if (user?.id) {
      router.push("/");
    }
  }, [router, user]);
  return (
    <AuthRedirect to={"/"} redirectIf={"logged-in"}>  {/* Redirects to "/" if logged in, otherwise renders children */}
      <SignupComponent className={"flex flex-col items-center justify-center w-full max-w-md mx-auto"} />
    </AuthRedirect>
  );
}