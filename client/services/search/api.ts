import { request } from "@/utils/request";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

/**
 * Calls the search endpoint on the server and returns the results
 */
export const requestSearch = async (organizationId: string, query: string, type: string = null) => {
  try {
    const results = await request(`${apiUrl}/organizations/${organizationId}/search?q=${query}&type=${type}`, {
      method: "GET",
      credentials: "include"
    });

    return Promise.resolve(results);
  } catch (err) {
    console.log(err);
    return Promise.reject("Error searching");
  }
};