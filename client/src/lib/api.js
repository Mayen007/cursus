const SERVER_URL = (import.meta.env?.VITE_SERVER_URL || "http://localhost:5000").replace(/\/$/, "");

export async function apiRequest(path, { body, method = "GET" } = {}) {
  const headers = {};
  const token = sessionStorage.getItem("sessionToken");
  if (token) headers.Authorization = `Bearer ${token}`;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body && !isFormData) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${SERVER_URL}/api${path}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new Error("Could not reach the server. Check that it is running and try again.");
  }

  if (response.status === 204) return null;
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response. Try again later.");
  }
  if (!response.ok) {
    const details = Array.isArray(result.details) ? result.details.filter(Boolean) : [];
    const message = result.error || "The request could not be completed.";
    throw new Error([message, ...details].join(" "));
  }
  return result;
}

export async function getServerStatus() {
  const response = await fetch(SERVER_URL);

  if (!response.ok) {
    throw new Error(`Server request failed with status ${response.status}`);
  }

  return response.json();
}
