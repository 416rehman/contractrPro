import SignupForm from "@/components/signupForm";
import { subtitle, title } from "@/components/primitives";

/**
 * This is the main call to action on the home page. It contains a title, subtitle, and a signup form.
 * This is usually the first thing a user sees when they visit the site, if they are not logged in.
 * It is also used as the fallback for the home page if the user is not logged in.
 */
export default function HomeCTA() {
  return (
    <div className="flex flex-row gap-x-8 gap-y-8 flex-wrap justify-center items-center flex-grow">
      <div className="flex flex-col w-fit gap-y-4">
        <div className="flex flex-col">
          <h1 className={title({ color: "turquoise" })}>ContractrPro</h1>
          <h2 className={title()}>Take control of your business</h2>
        </div>
        <h3 className={subtitle()}>
          ContractrPro is a simple, easy to use, and powerful <br />
          tool to help you manage your business.
        </h3>
      </div>
      <div className="flex flex-col gap-y-4 w-full md:w-1/3">
        <h3 className="text-2xl font-semibold">Get started today</h3>
        <SignupForm />
      </div>
    </div>
  );
}