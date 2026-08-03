import type { ApiClient } from './types'
import { mockApi } from './mock'
import { realApi } from './real'

export const API_MODE: 'mock' | 'real' = import.meta.env.VITE_API_MODE === 'real' ? 'real' : 'mock'

export const api: ApiClient = API_MODE === 'real' ? realApi : mockApi

export * from './types'
