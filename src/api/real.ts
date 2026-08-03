import { ApiError } from './types'
import type {
  AgentDecision,
  AgentRole,
  AgentStatusItem,
  ApiClient,
  AuditResult,
  AuthResult,
  BreakdownRow,
  CampaignDetail,
  CampaignListFilter,
  CampaignProgress,
  CampaignSummary,
  Certificate,
  CloseCampaignResult,
  ContributionList,
  CreateCampaignInput,
  CreateCampaignResult,
  CreateTierInput,
  EvaluateResult,
  MyContribution,
  PayQr,
  PayStatus,
  PayshUsage,
  ProofDetail,
  QuoteItem,
  QuoteSubmitInput,
  RecordContributionResult,
  RegisterVendorInput,
  RegisterVendorResult,
  Settlement,
  Tier,
  UpdateCampaignInput,
  UpdateProfileInput,
  User,
  Vendor,
} from './types'
import { loadAuth, updateAccessToken } from './token'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

interface RequestOptions {
  body?: unknown
  auth?: boolean
  token?: string
  headers?: Record<string, string>
  formData?: FormData
  retried?: boolean
}

async function request<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { ...options.headers }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`
  } else if (options.auth) {
    const stored = loadAuth()
    if (stored) headers['Authorization'] = `Bearer ${stored.accessToken}`
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: options.formData ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
  })
  if (res.status === 401 && options.auth && !options.token && !options.retried) {
    const refreshed = await tryRefresh()
    if (refreshed) return request<T>(method, path, { ...options, retried: true })
  }
  if (!res.ok) {
    let message = `요청 실패 (${res.status})`
    try {
      const data = await res.json()
      if (typeof data.message === 'string') message = data.message
    } catch {
      void 0
    }
    throw new ApiError(res.status, message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

async function tryRefresh(): Promise<boolean> {
  const stored = loadAuth()
  if (!stored) return false
  try {
    const data = await request<{ accessToken: string }>('POST', '/auth/refresh', {
      body: { refreshToken: stored.refreshToken },
      retried: true,
    })
    updateAccessToken(data.accessToken)
    return true
  } catch {
    return false
  }
}

interface RawProofItem {
  name: string
  unit_price: number
  quantity: number
}

export const realApi: ApiClient = {
  async signup(email, password, name) {
    return request<AuthResult>('POST', '/auth/signup', { body: { email, password, name } })
  },

  async login(email, password) {
    const tokens = await request<{ accessToken: string; refreshToken: string }>('POST', '/auth/login', {
      body: { email, password },
    })
    const user = await request<User>('GET', '/users/me', { token: tokens.accessToken })
    return { ...tokens, user }
  },

  async logout(refreshToken) {
    await request<void>('POST', '/auth/logout', { body: { refreshToken }, auth: true })
  },

  async walletNonce(walletAddress) {
    const data = await request<{ nonce: string }>('POST', '/auth/wallet/nonce', {
      body: { walletAddress },
    })
    return data.nonce
  },

  async walletConnect(walletAddress, signature, nonce) {
    const data = await request<{ walletAddress: string }>('POST', '/auth/wallet/connect', {
      body: { walletAddress, signature, nonce },
      auth: true,
    })
    return data.walletAddress
  },

  async walletLogin(walletAddress, signature, nonce) {
    const tokens = await request<{ accessToken: string; refreshToken: string }>(
      'POST',
      '/auth/wallet/login',
      { body: { walletAddress, signature, nonce } },
    )
    const user = await request<User>('GET', '/users/me', { token: tokens.accessToken })
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user }
  },

  async getMe() {
    return request<User>('GET', '/users/me', { auth: true })
  },

  async updateMe(input: UpdateProfileInput) {
    await request<{ message: string }>('POST', '/users/me', { body: input, auth: true })
  },

  async getMyContributions() {
    const data = await request<{ contributions: MyContribution[] }>('GET', '/users/me/contributions', {
      auth: true,
    })
    return data.contributions
  },

  async getMyCertificates() {
    const data = await request<{ certificates: Certificate[] }>('GET', '/users/me/certificates', {
      auth: true,
    })
    return data.certificates
  },

  async withdraw() {
    await request<{ message: string }>('DELETE', '/users/me/withdraw', { auth: true })
  },

  async listCampaigns(filter?: CampaignListFilter) {
    const params = new URLSearchParams()
    if (filter?.status) params.set('status', filter.status)
    if (filter?.category) params.set('category', filter.category)
    const qs = params.size > 0 ? `?${params.toString()}` : ''
    const data = await request<{ campaigns: CampaignSummary[] }>('GET', `/campaign${qs}`)
    return data.campaigns
  },

  async getCampaign(id) {
    return request<CampaignDetail>('GET', `/campaign/${id}`)
  },

  async getCampaignStatus(id) {
    return request<CampaignProgress>('GET', `/campaign/${id}/status`)
  },

  async getContributions(id) {
    return request<ContributionList>('GET', `/campaign/${id}/contributions`)
  },

  async getQuotes(id) {
    const data = await request<{ quotes: QuoteItem[] }>('GET', `/campaign/${id}/quotes`)
    return data.quotes
  },

  async createCampaign(input: CreateCampaignInput) {
    return request<CreateCampaignResult>('POST', '/campaign', { body: input, auth: true })
  },

  async updateCampaign(id, input: UpdateCampaignInput) {
    await request<{ message: string }>('POST', `/campaign/${id}`, { body: input, auth: true })
  },

  async closeCampaign(id) {
    return request<CloseCampaignResult>('POST', `/campaign/${id}/close`, { auth: true })
  },

  async getTiers(campaignId) {
    const data = await request<{ tiers: Tier[] }>('GET', `/campaign/${campaignId}/tiers`)
    return data.tiers
  },

  async createTier(campaignId, input: CreateTierInput) {
    const data = await request<{ tierId: number }>('POST', `/campaign/${campaignId}/tiers`, {
      body: input,
      auth: true,
    })
    return data.tierId
  },

  async createPayQr(campaignId, amount, tierId) {
    return request<PayQr>('POST', '/payment/solana-pay/qr', {
      body: tierId !== undefined ? { campaignId, tierId } : { campaignId, amount },
      auth: true,
    })
  },

  async getPayStatus(reference) {
    return request<PayStatus>('GET', `/payment/solana-pay/${reference}/status`)
  },

  async recordContribution(reference, txSignature) {
    return request<RecordContributionResult>('POST', '/payment/contribute', {
      body: { reference, txSignature },
      auth: true,
    })
  },

  async getPayshUsage(campaignId) {
    return request<PayshUsage>('GET', `/payment/paysh/usage?campaignId=${campaignId}`, { auth: true })
  },

  async listVendors(allowlisted) {
    const qs = allowlisted !== undefined ? `?allowlisted=${allowlisted}` : ''
    const data = await request<{ vendors: Vendor[] }>('GET', `/vendor${qs}`)
    return data.vendors
  },

  async registerVendor(input: RegisterVendorInput) {
    return request<RegisterVendorResult>('POST', '/vendor', { body: input })
  },

  async getProof(proofId) {
    const raw = await request<Omit<ProofDetail, 'items'> & { items: RawProofItem[] }>(
      'GET',
      `/proof/${proofId}`,
    )
    return {
      ...raw,
      items: raw.items.map((i) => ({ name: i.name, unitPrice: i.unit_price, quantity: i.quantity })),
    }
  },

  async getSettlement(campaignId) {
    return request<Settlement>('GET', `/settlement/${campaignId}`)
  },

  async getBreakdown(campaignId) {
    const data = await request<{ breakdown: BreakdownRow[] }>('GET', `/settlement/${campaignId}/breakdown`)
    return data.breakdown
  },

  async evaluatePolicy(campaignId, proofId) {
    return request<EvaluateResult>('POST', '/agent/policy/evaluate', {
      body: { campaignId, proofId },
      auth: true,
    })
  },

  async runAudit(campaignId) {
    return request<AuditResult>('POST', '/agent/audit', { body: { campaignId }, auth: true })
  },

  async getAgentStatus(campaignId) {
    const qs = campaignId !== undefined ? `?campaignId=${campaignId}` : ''
    const data = await request<{ agents: AgentStatusItem[] }>('GET', `/agent/status${qs}`, { auth: true })
    return data.agents
  },

  async getDecisions(campaignId) {
    const data = await request<{ decisions: RawDecision[] }>('GET', `/agent/${campaignId}/decisions`)
    return data.decisions.map(toDecision)
  },

  async uploadProofFile(apiKey, file) {
    const formData = new FormData()
    formData.append('file', file)
    const data = await request<{ fileUrl: string }>('POST', '/proof/upload', {
      formData,
      headers: { 'X-Vendor-Key': apiKey },
    })
    return data.fileUrl
  },

  async submitQuote(apiKey, vendorId, input: QuoteSubmitInput) {
    const data = await request<{ proofId: number }>('POST', `/vendor/${vendorId}/quote`, {
      body: input,
      headers: { 'X-Vendor-Key': apiKey },
    })
    return data.proofId
  },

  async submitReceipt(apiKey, input: QuoteSubmitInput) {
    const data = await request<{ proofId: number }>('POST', '/proof/receipt', {
      body: input,
      headers: { 'X-Vendor-Key': apiKey },
    })
    return data.proofId
  },
}

interface RawDecision {
  id: number
  proofId: number | null
  role: AgentRole
  decision: 'approve' | 'reject'
  requiredAmount: number
  reasons: string[]
  model: string
  readFile: boolean
  createdAt: string
}

function toDecision(raw: RawDecision): AgentDecision {
  const executed = raw.role === 'settlement-refund' && raw.decision === 'approve'
  return {
    at: raw.createdAt,
    agent: raw.role,
    action: raw.proofId !== null ? `증빙 #${raw.proofId}` : raw.model,
    result: executed ? 'execute' : raw.decision,
    reason: raw.reasons?.join(' · ') ?? '',
  }
}
