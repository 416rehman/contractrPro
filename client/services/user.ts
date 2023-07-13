import { useUserStore } from "@/state/user";

const apiUrl = process.env.API_URL || "http://localhost:4000";

// Gets the user's organizations from the server, and stores them in the user store and returns them
export async function getUserOrganizations(UserId = "me") {
  try {
    const result = await fetch(`${apiUrl}/users/${UserId}/organizations`, {
      method: "GET",
      credentials: "include"
    });
    const body = await result.json();
    if (!result.ok) {
      return Promise.reject(body.message);
    }
    const setUser = useUserStore.getState().setUser;
    setUser({ ...useUserStore.getState().user, Organizations: body.data?.Organizations });
    return Promise.resolve(body.data?.Organizations);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}