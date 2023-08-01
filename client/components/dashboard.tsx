"use client";
import { title } from "@/components/primitives";
import { useUserStore } from "@/services/user";

var greeting = () => {

  var hours = new Date().getHours();

  var greet;

  if (hours < 12) {
    greet = 'Good Morning';
  }
  else if (hours >= 12 && hours <= 17) {
    greet = 'Good Afternoon';
  }
  else if (hours >= 17 && hours <= 24) {
    greet = 'Good Evening';
  }

  return greet;
}

/**
 * This is the main call to action on the home page. It contains a title and a dashboard.
 * This is usually the first thing a user sees when they visit the site, if they are logged in.
 * It is also used as the fallback for the home page if the user is logged in.
 */
export default function Dashboard() {

const user = useUserStore(state => state.user);

  return (
    <div className="flex flex-row gap-x-9 gap-y-8 flex-wrap justify-start items-start flex-grow mt-4 ml-4">
      <div className="flex flex-col w-fit gap-y-5">
        <div className="flex flex-col">
          <h1 className={title({ color: "white" })}>{greeting()}, {user.username}!</h1>
        </div>
      </div>
    </div>

  );
}