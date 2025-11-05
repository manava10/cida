import { apiPost } from './api.js'

export async function logoutAndRedirect(path = '/') {
  try {
    await apiPost('/api/auth/logout')
  } catch {}
  window.location.href = path
}


