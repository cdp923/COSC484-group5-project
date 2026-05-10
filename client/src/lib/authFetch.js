import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function useAuthFetch() {
  const navigate = useNavigate();

  const authFetch = useCallback(
    async (url, options = {}) => {
      const token = localStorage.getItem("token");
      const headers = { Accept: "application/json", ...options.headers };

      if (token) headers.Authorization = `Bearer ${token}`;
      if (options.body !== undefined && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        throw new Error("Unauthorized");
      }

      const text = await response.json();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!response.ok) {
        const msg =
          (data && data.message) ||
          (data && data.error) ||
          response.statusText ||
          "Request failed";
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      return data;
    },
    [navigate],
  );

  return authFetch;
}
