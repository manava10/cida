const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

async function handleResponse(res, path) {
  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = res.statusText || errorMessage;
    }
    const error = new Error(errorMessage);
    error.status = res.status;
    error.statusText = res.statusText;
    throw error;
  }
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' })
  return handleResponse(res, path);
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body || {})
  })
  return handleResponse(res, path);
}

export async function apiPostForm(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })
  return handleResponse(res, path);
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  return handleResponse(res, path);
}


