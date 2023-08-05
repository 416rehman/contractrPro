import { requestAccessToken, requestCreateAccount, requestLogout, requestRefreshToken } from "@/services/auth/api";
import jwtDecode from "jwt-decode";
import { useUserStore } from "@/services/user";
import { removeLocalStorageItem, setLocalStorageItem } from "@/utils/safeLocalStorage";

// Gets a new access token from the server using the refresh token
// On success, it will update the accessToken and refreshToken in local storage and return the new access token
export const getNewAccessToken = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      return Promise.reject("No refresh token provided");
    }

    const accessToken = await requestAccessToken(refreshToken);
    if (!accessToken) {
      return Promise.reject("Server did not return an access token");
    }

    // if localstorage is defined, update the refresh and access tokens in local storage
    try {
      setLocalStorageItem("accessToken", accessToken);
      setLocalStorageItem("refreshToken", refreshToken);
    } catch (e) {
      console.error("Local storage is not defined. You are probably in a server component.");
    }

    return Promise.resolve(accessToken);
  } catch (err) {
    return Promise.reject(err);
  }
};

// User Manager - A manager uses the service.ts to perform actions such as API calls to login, requestLogout, etc. and then updates the store
export const login = async (username: string, password: string) => {
  try {
    const refreshToken = await requestRefreshToken(username, password);
    const accessToken = await getNewAccessToken(refreshToken);

    const decodedToken: any = jwtDecode(accessToken);
    if (!decodedToken) {
      return Promise.reject("Invalid token");
    }

    useUserStore.getState().setUser(decodedToken);
    return Promise.resolve(decodedToken);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const logout = async () => {
  try {
    await requestLogout();
    removeLocalStorageItem("refreshToken");
    removeLocalStorageItem("accessToken");
    removeLocalStorageItem("currentOrganization");

    useUserStore.getState().setUser(null);
    return Promise.resolve(true);
  } catch (err) {
    return Promise.reject(err || "Error logging out");
  }
};

export const signup = async (username: string, email: string, password: string) => {
  try {
    const accountInfo = await requestCreateAccount(username, email, password);
    await new Promise((resolve) => setTimeout(resolve, 1000));  // wait 1 second to make sure the account is created
    const accessToken = await getNewAccessToken(accountInfo.refreshToken);

    const decodedToken: any = jwtDecode(accessToken);
    if (!decodedToken) {
      return Promise.reject("Invalid token");
    }

    useUserStore.getState().setUser(decodedToken);
    return Promise.resolve(decodedToken);
  } catch (err) {
    return Promise.reject(err);
  }
};