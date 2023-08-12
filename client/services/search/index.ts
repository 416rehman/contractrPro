// Gets a new access token from the server using the refresh token
// On success, it will update the accessToken and refreshToken in local storage and return the new access token
import { requestSearch } from "@/services/search/api";

export const search = async (organizationId: string, query: string, type: string = null) => {
  try {
    const results = await requestSearch(organizationId, query, type);
    return Promise.resolve(results);
  } catch (err) {
    console.log(err);
    return Promise.reject("Error searching");
  }
};