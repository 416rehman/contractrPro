const apiUrl = (process.env.API_URL || "http://localhost:4000");
/**
 * Gets a refresh token from the server, and stores it in local storage key "refreshToken"
 * @param username
 * @param password
 */
export const requestRefreshToken = async (username: string, password: string) => {
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

    const body = await response.json();
    if (!response.ok) { // if the response is not 200 OK (On error, our server uses response 400, and provides a message in the body)
      const message = body.message || "Invalid username or password";
      return Promise.reject(message);
    }

    if (!body.data.refreshToken) {
      return Promise.reject("No refresh token provided");
    }

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
export const requestAccessToken = async (refreshToken: string) => {
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

    const body = await response.json();
    if (!response.ok) {
      const message = body.message || "Invalid refresh token";  // if the response is not 200 OK (On error, our server uses response 400, and provides a message in the body)
      return Promise.reject(message);
    }

    if (!body.data.token) {
      return Promise.reject("No access token provided");
    }

    return Promise.resolve(body.data.token);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

export const requestCreateAccount = async (email: string, password: string, username: string) => {
  try {
    const response = await fetch(`${apiUrl}/auth/account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
      credentials: "include"
    });

    const body = await response.json();
    if (!response.ok) {
      const message = body.message || "Invalid username or password";  // if the response is not 200 OK (On error, our server uses response 400, and provides a message in the body)
      return Promise.reject(message);
    }

    if (!body.data.refreshToken) {
      return Promise.reject("Server did not return a refresh token");
    }

    return Promise.resolve(body.data);
  } catch (err) {
    return Promise.reject(err.message);
  }
};

/**
 * Calls the requestLogout endpoint on the server
 */
export const requestLogout = async () => {
  try {
    await fetch(`${apiUrl}/auth/logout`, {
      credentials: "include"
    });

    return Promise.resolve("Logged out");
  } catch (err) {
    console.log(err);
    return Promise.reject("Error logging out");
  }
};