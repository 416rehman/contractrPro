import { request } from "@/utils/request";

const apiUrl = process.env.API_URL || "http://localhost:4000";

// Gets the loggedInUser's organizations from the server, and stores them in the loggedInUser store and returns them
export async function requestUserOrganizations(UserId = "me") {
  try {
    const data = await request(`${apiUrl}/users/${UserId}/organizations`, {
      method: "GET",
      credentials: "include"
    });
    
    return Promise.resolve(data?.Organizations);
  } catch (err) {
    console.log(err);
    return Promise.reject(err?.message || err);
  }
}