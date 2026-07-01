// Cliente HTTP simples usando fetch nativo — sem axios
const BASE = ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
    ...options,
  })

  if (res.status === 401) {
    // Tenta renovar o token silenciosamente
    const refreshed = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    if (refreshed.ok) {
      // Retry original request
      const retry = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        credentials: 'include',
        ...options,
      })
      if (!retry.ok) throw new Error(await retry.text())
      return retry.json()
    }
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
