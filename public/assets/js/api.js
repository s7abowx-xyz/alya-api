const API_BASE = "/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || "حدث خطأ غير متوقع، الرجاء المحاولة لاحقًا";
    throw new Error(message);
  }

  return data;
}

const Api = {
  register: (payload) =>
    apiRequest("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    apiRequest("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
  me: () => apiRequest("/auth/me", { method: "GET" }),
};
