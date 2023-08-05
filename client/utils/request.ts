import getCookieValue from "@/utils/getCookieValue";
import jwtDecode from "jwt-decode";
import { getNewAccessToken } from "@/services/auth";

type AuthOptions = {
  refreshToken?: string;  // Use this refreshToken instead of the one in the cookie to get a new accessToken.
  accessToken?: string;   // Use this accessToken for authentication instead of the one in the cookie. If this is expired, it will use the refreshToken to get a new accessToken.
} & RequestInit;

// The request utility will return a typed response and automatically renew the access token if it is expired.
// By default it will use the accessToken and refreshToken in the cookie, but you can override this by passing in a refreshToken or accessToken in the options.
export async function request(url: string, options: AuthOptions = { credentials: "include" }, defaults = true) {
  const accessToken = options.accessToken || getCookieValue("accessToken");
  const refreshToken = options.refreshToken || getCookieValue("refreshToken");

  if (accessToken && refreshToken) {
    // check if the accessToken is expired
    const decodedToken: any = jwtDecode(accessToken);
    if (decodedToken && decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
      // if it is expired, use the refreshToken to get a new accessToken
      try {
        const newAccessToken = await getNewAccessToken(refreshToken);
        if (newAccessToken) {
          options.accessToken = newAccessToken;
        }

        console.log("Auto renewed access token");
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }

  try {
    if (defaults) { // Set default options
      if (!options?.headers?.["Content-Type"]) {
        options.headers = {
          ...options.headers,
          "Content-Type": "application/json"
        };
      }
    }

    const result = await fetch(url, options);
    const body = await result.json();
    if (!result.ok) {
      return Promise.reject(body.message);
    }

    return Promise.resolve(body.data);
  } catch (err) {
    return Promise.reject(err);
  }
}