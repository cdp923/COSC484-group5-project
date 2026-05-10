const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export { baseURL };

export async function authFetch(url, options = {}) { // Authentication Fetch wrapper that handles token and headers
  const token = localStorage.getItem("token");
  const headers = { Accept: "application/json", ...options.headers };

  if (token) headers.Authorization = `Bearer ${token}`; // Attaches Bearer token from localStorage
  if (options.body !== undefined && !(options.body instanceof FormData)) { // Sets Content-Type: application/json when a body is present
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) { // If unauthorized, clears token and redirects to /login
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null; // Parses JSON response if it exists
  } catch {
    data = text; // If not, returns the text
  }

  if (!response.ok) {
    const msg =
      (data && data.message) ||
      (data && data.error) ||
      res.statusText ||
      "Request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return data;
}
