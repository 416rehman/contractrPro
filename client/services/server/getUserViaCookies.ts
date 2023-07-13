import { cookies } from "next/headers";
import jwtDecode from "jwt-decode";
import { getAccessToken } from "@/services/auth";

/**
 * SERVER-SIDE ONLY
 * Gets signedInUser from the token stored in the "accessToken" cookie
 * if the token is invalid, it will try to get a new access token from the refresh token stored in the "refreshToken" cookie
 * otherwise, it will return null
 */
export const getUserViaCookies = async (accessTokenCookieName = "accessToken", refreshTokenCookieName = "refreshToken") => {
  const tokenCookie = cookies().get(accessTokenCookieName || "token");

  let accessToken = tokenCookie?.value || null;
  if (accessToken) {
    const user: any = jwtDecode(accessToken);
    if (user?.exp * 1000 > Date.now() && user?.id) {
      return user;
    }
  }

  // if we get here, the access token is invalid or missing
  // do we have a refresh token?
  const refreshTokenCookie = cookies().get(refreshTokenCookieName || "refreshToken");
  const refreshToken = refreshTokenCookie?.value || null;
  if (refreshToken) {
    // we have a refresh token, use it to get a new access token
    accessToken = await getAccessToken(refreshToken);
    if (accessToken) {
      const user: any = jwtDecode(accessToken);
      if (user?.exp * 1000 > Date.now() && user?.id) {
        return user;
      }
    }
  }

  // otherwise, return null
  return null;
};