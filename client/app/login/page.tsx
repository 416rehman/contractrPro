import LoginComponent from "@/components/login";
import AuthRedirectServer from "@/components/server/authRedirectServer";
// import { useEffect } from "react";

export const metadata = {
  title: "Log In"
};


export default function LoginPage() {
  // const router = useRouter();
  // const signedInUser = useUserStore(state => state.signedInUser);
  //
  // useEffect(() => {
  //   if (signedInUser?.id) {
  //     router.push("/");
  //   }
  // }, [router, signedInUser]);
  // make sure we are not logged in by checking the cookie "token"
  // if we are logged in, redirect to the home page

  return (
    <>
      <AuthRedirectServer redirectIf={"logged-in"} to={"/"}>
        <div className={"flex flex-col items-center justify-center w-full h-full"}>
          <LoginComponent className={"flex flex-col items-center justify-center"} />
        </div>
      </AuthRedirectServer>
    </>
  );
}