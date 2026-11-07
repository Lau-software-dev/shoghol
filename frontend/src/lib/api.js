// The API on the same origin. Errors carry the server's code and a message ready to show.
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const write = method !== 'GET'
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: write ? { 'content-type': 'application/json' } : undefined,
      body: write ? JSON.stringify(body ?? {}) : undefined,
    })
  } catch {
    throw new ApiError(0, 'offline', 'Can’t reach the server. Check your connection.')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok)
    throw new ApiError(res.status, data?.code ?? 'error', data?.message ?? 'Something went wrong. Try again.')
  return data
}
