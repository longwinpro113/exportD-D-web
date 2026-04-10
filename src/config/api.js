const rawApiUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = rawApiUrl
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

export const buildApiUrl = (path = "") => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
