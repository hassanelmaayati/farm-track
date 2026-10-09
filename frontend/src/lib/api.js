export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const request = async (method, path, body) => {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // A 401 outside the auth endpoints means the session ended; let the app react.
    if (res.status === 401 && !path.startsWith("/auth/")) {
      window.dispatchEvent(new Event("farmtrack:unauthorized"));
    }
    throw new ApiError(res.status, data.message || "Something went wrong.", data.details);
  }
  return data;
};

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body ?? {}),
  put: (path, body) => request("PUT", path, body ?? {}),
  del: (path) => request("DELETE", path),
};

// Build "?a=1&b=2" from an object, skipping empty values.
export const toQuery = (params = {}) => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") qs.set(key, value);
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
};
