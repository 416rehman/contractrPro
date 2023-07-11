import { useUserStore } from "@/state/user";
import jwtDecode from "jwt-decode";

const apiUrl = process.env.API_URL || "http://localhost:4000";

/**
 * Gets a refresh token from the server, and stores it in local storage key "refreshToken"
 * @param username
 * @param password
 */
export const getRefreshToken = async (username: string, password: string) => {
  try {
    if (!username || !password) {
      return Promise.reject("No username or password provided");
    }
    const reqBody = { password };

    //check if username is an email
    if (username.indexOf("@") < username.indexOf(".")) {
      reqBody["email"] = username;
    } else {
      reqBody["username"] = username;
    }

    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
      credentials: "include"
    });

    if (!response.ok) {
      return Promise.reject("Invalid username or password");
    }

    const body = await response.json();
    if (!body.data.refreshToken) {
      return Promise.reject("No refresh token provided");
    }

    localStorage.setItem("refreshToken", body.data.refreshToken);
    return Promise.resolve(body.data.refreshToken);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

/**
 * Gets an access token from the server, and stores it in local storage key "accessToken"
 * @param refreshToken
 */
export const getAccessToken = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      return Promise.reject("No refresh token provided");
    }

    const response = await fetch(`${apiUrl}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      credentials: "include"
    });

    if (!response.ok) {
      return Promise.reject("Invalid refresh token");
    }

    const body = await response.json();
    if (!body.data.token) {
      return Promise.reject("No access token provided");
    }

    localStorage.setItem("accessToken", body.data.token);
    return Promise.resolve(body.data.token);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

// Calls the login API, then uses the refresh token to get a new access token
export const login = async (username: string, password: string) => {
  try {
    await getRefreshToken(username, password);
    const refreshToken = localStorage.getItem("refreshToken");

    await getAccessToken(refreshToken);
    const accessToken = localStorage.getItem("accessToken");

    const decodedToken: any = jwtDecode(accessToken);
    if (!decodedToken) {
      return Promise.reject("Invalid token");
    }

    const setUser = useUserStore.getState().setUser;
    setUser(decodedToken);

    return Promise.resolve(true);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

export const signup = async (email: string, password: string, username: string) => {
  try {
    const signupResponse = await fetch(`${apiUrl}/auth/account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
      credentials: "include"
    });
    if (!signupResponse.ok) {
      return Promise.reject("Invalid username or password");
    }

    const body = await signupResponse.json();
    console.log(body);
    if (!body.data.refreshToken) {
      return Promise.reject("No refresh token provided");
    }

    const refreshToken = body.data.refreshToken;
    localStorage.setItem("refreshToken", refreshToken);

    // wait a second to let the server create the user
    await new Promise(resolve => setTimeout(resolve, 1000));

    const accessToken = await getAccessToken(refreshToken);

    const decodedToken: any = jwtDecode(accessToken);
    if (!decodedToken) {
      return Promise.reject("Invalid token");
    }

    const setUser = useUserStore.getState().setUser;
    setUser(decodedToken);

    return true;
  } catch (err) {
    return Promise.reject(err.message);
  }
};

/**
 * Logs the user out by removing the refresh and access tokens from local storage, and setting the user to null
 */
export const logout = async () => {
  try {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");

    const setUser = useUserStore.getState().setUser;
    setUser(null);

    return Promise.resolve("Logged out");
  } catch (err) {
    console.log(err);
    return Promise.reject("Error logging out");
  }
};