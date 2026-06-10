const jsonHeaders = {
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const token = localStorage.getItem("giventake_token");
  const headers = {
    ...jsonHeaders,
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "משהו השתבש");
  }

  return data;
}

export const api = {
  me: () => request("/api/auth/me"),
  login: (payload) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  register: (payload) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateProfile: (payload) =>
    request("/api/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getItems: (query = "") => request(`/api/items${query}`),
  createItem: (payload) =>
    request("/api/items", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateItem: (id, payload) =>
    request(`/api/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  toggleFavorite: (itemId) =>
    request(`/api/favorites/${itemId}`, {
      method: "POST",
    }),
  getFavorites: () => request("/api/favorites"),
  getInbox: () => request("/api/trades/inbox"),
  createTrade: (payload) =>
    request("/api/trades", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTrade: (id, payload) =>
    request(`/api/trades/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  sendMessage: (tradeId, payload) =>
    request(`/api/trades/${tradeId}/messages`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getNotifications: () => request("/api/notifications"),
  getAdmin: () => request("/api/admin/overview"),
};
