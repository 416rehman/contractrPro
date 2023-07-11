import LoginComponent from "@/components/login";

import AuthRedirect from "@/components/authRedirect";

export const metadata = {
  title: "Log In"
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
    <AuthRedirect redirectIf={"logged-in"} to={"/"}>
      <LoginComponent className={"flex flex-col items-center justify-center w-full max-w-md mx-auto"} />
    </AuthRedirect>
  );
}