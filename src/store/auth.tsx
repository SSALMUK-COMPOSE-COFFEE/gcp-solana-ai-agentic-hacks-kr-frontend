import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../api'
import type { User } from '../api'
import { clearAuth, loadAuth, saveAuth, updateStoredUser } from '../api/token'
import { connectWallet, signNonce } from '../lib/wallet'

interface AuthContextValue {
  user: User | null
  login(email: string, password: string): Promise<void>
  loginWithWallet(): Promise<void>
  signup(email: string, password: string, name: string): Promise<void>
  logout(): Promise<void>
  refreshUser(): Promise<void>
  clearSession(): void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadAuth()?.user ?? null)

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password)
    saveAuth(result)
    setUser(result.user)
  }, [])

  const loginWithWallet = useCallback(async () => {
    const walletAddress = await connectWallet()
    const nonce = await api.walletNonce(walletAddress)
    const signature = await signNonce(nonce)
    const result = await api.walletLogin(walletAddress, signature, nonce)
    saveAuth(result)
    setUser(result.user)
  }, [])

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const result = await api.signup(email, password, name)
    saveAuth(result)
    setUser(result.user)
  }, [])

  const logout = useCallback(async () => {
    const stored = loadAuth()
    if (stored) {
      try {
        await api.logout(stored.refreshToken)
      } catch {
        void 0
      }
    }
    clearAuth()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const me = await api.getMe()
    updateStoredUser(me)
    setUser(me)
  }, [])

  const clearSession = useCallback(() => {
    clearAuth()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, login, loginWithWallet, signup, logout, refreshUser, clearSession }),
    [user, login, loginWithWallet, signup, logout, refreshUser, clearSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider가 필요합니다')
  return ctx
}
