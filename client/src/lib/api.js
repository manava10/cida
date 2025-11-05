const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001'

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' })
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`)
  return res.json()
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body || {})
  })
  if (!res.ok) throw new Error(`POST ${path} ${res.status}`)
  return res.json()
}

export async function apiPostForm(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })
  if (!res.ok) throw new Error(`POST ${path} ${res.status}`)
  return res.json()
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  if (!res.ok) throw new Error(`DELETE ${path} ${res.status}`)
  return res.json()
}


