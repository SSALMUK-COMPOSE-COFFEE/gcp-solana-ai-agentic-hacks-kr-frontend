import type { User } from './types'

const KEY = 'chongdae.auth'

export interface StoredAuth {
  accessToken: string
  refreshToken: string
  user: User
}

export function loadAuth(): StoredAuth | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function saveAuth(auth: StoredAuth): void {
  localStorage.setItem(KEY, JSON.stringify(auth))
}

export function clearAuth(): void {
  localStorage.removeItem(KEY)
}

export function updateAccessToken(accessToken: string): void {
  const stored = loadAuth()
  if (stored) saveAuth({ ...stored, accessToken })
}

export function updateStoredUser(user: User): void {
  const stored = loadAuth()
  if (stored) saveAuth({ ...stored, user })
}
