// One place for every HTTP call the app makes. Errors are normalised so
// callers can rely on err.status and err.data (the server sends
// { errors: { field: message } } when validation fails).

async function handle(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function queryString(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) qs.set(key, value);
  });
  const text = qs.toString();
  return text ? `?${text}` : '';
}

function authHeaders() {
  const token = localStorage.getItem('zenvora_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const hotelsApi = {
  list: (filters) => fetch(`/api/hotels${queryString(filters)}`).then(handle),
  get: (id) => fetch(`/api/hotels/${id}`).then(handle),
  create: (formData) =>
    fetch('/api/hotels', { method: 'POST', headers: authHeaders(), body: formData }).then(handle),
  update: (id, formData) =>
    fetch(`/api/hotels/${id}`, { method: 'PUT', headers: authHeaders(), body: formData }).then(handle),
  remove: (id) =>
    fetch(`/api/hotels/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),
};

export const reservationsApi = {
  create: (data) =>
    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handle),
  listMy: () =>
    fetch('/api/reservations/my', {
      headers: authHeaders(),
    }).then(handle),
  getMy: (id) =>
    fetch(`/api/reservations/my/${id}`, {
      headers: authHeaders(),
    }).then(handle),
  cancelMy: (id) =>
    fetch(`/api/reservations/my/${id}/cancel`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then(handle),
  adminList: (params) =>
    fetch(`/api/admin/reservations${queryString(params || {})}`, {
      headers: authHeaders(),
    }).then(handle),
  adminGet: (id) =>
    fetch(`/api/admin/reservations/${id}`, {
      headers: authHeaders(),
    }).then(handle),
  adminUpdateStatus: (id, status) =>
    fetch(`/api/admin/reservations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status }),
    }).then(handle),
};
