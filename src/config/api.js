const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
// const rawApiUrl = "http://localhost:5000";


export const API_BASE_URL = rawApiUrl
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

export const buildApiUrl = (path = "") => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
