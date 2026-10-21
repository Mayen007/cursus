import { apiRequest } from "./api.js";

const SERVER_URL = (import.meta.env.VITE_SERVER_URL || "http://localhost:5000").replace(/\/$/, "");

async function postCredentials(endpoint, credentials) {
  let response;

  try {
    response = await fetch(`${SERVER_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new Error("Could not reach the server. Check that it is running and try again.");
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response. Try again later.");
  }

  if (!response.ok) {
    throw new Error(result.error || "We could not complete your request.");
  }
  if (typeof result.token !== "string" || result.token.length === 0) {
    throw new Error("The server response did not include a session token.");
  }

  sessionStorage.setItem("sessionToken", result.token);
  sessionStorage.setItem("sessionUser", JSON.stringify(result.user || {}));
}

export function clearSession() {
  sessionStorage.removeItem("sessionToken");
  sessionStorage.removeItem("sessionUser");
}

export async function getCurrentUser() {
  const token = sessionStorage.getItem("sessionToken");
  if (!token) return null;

  let response;
  try {
    response = await fetch(`${SERVER_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Could not reach the server. Check that it is running and try again.");
  }

  if (response.status === 401) {
    clearSession();
    return null;
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response. Try again later.");
  }
  if (!response.ok || !result.user) {
    throw new Error(result.error || "We could not verify your session.");
  }

  sessionStorage.setItem("sessionUser", JSON.stringify(result.user));
  return result.user;
}

export function authenticateUser(credentials) {
  return postCredentials("login", credentials);
}

export function registerUser(userDetails) {
  return postCredentials("register", userDetails);
}

export async function updateAccount(userDetails) {
  const result = await apiRequest("/auth/me", { method: "PATCH", body: userDetails });
  sessionStorage.setItem("sessionUser", JSON.stringify(result.user));
  return result.user;
}

export function updatePassword(passwordDetails) {
  return apiRequest("/auth/me/password", { method: "PATCH", body: passwordDetails });
}

export function removeAccount(password) {
  return apiRequest("/auth/me", { method: "DELETE", body: { password } });
}
