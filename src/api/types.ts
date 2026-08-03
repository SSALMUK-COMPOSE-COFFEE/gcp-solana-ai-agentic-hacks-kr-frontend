export type CampaignStatus = '모금중' | '집행중' | '환불중' | '종료'

export type ProofStatus = '검토중' | '승인' | '거절'

export interface CampaignSummary {
  id: number
  title: string
  category: string
  goalAmount: number
  raisedAmount: number
  deadline: string
  status: CampaignStatus
}

export interface CategoryPolicy {
  maxUnitPrice?: number | null
  maxTotal?: number | null
  unitLabel?: string | null
}

export interface CampaignPolicy {
  categories?: Record<string, CategoryPolicy>
  maxPerCategory?: number | null
  allowSurplusScaling?: boolean
  aiReviewBudget?: number | null
}

export interface CampaignDetail extends CampaignSummary {
  escrowPda: string
  policy?: CampaignPolicy
}

export interface CampaignProgress {
  goalAmount: number
  raisedAmount: number
  progressRate: number
  contributorCount: number
  remainingSeconds: number
  status: CampaignStatus
}

export interface Contribution {
  userId: number | null
  name: string
  amount: number
  txSignature: string | null
  createdAt: string
}

export interface ContributionList {
  contributions: Contribution[]
  totalCount: number
}

export interface QuoteItem {
  proofId: number
  type: 'quote' | 'receipt'
  vendorId: number | null
  vendorName: string | null
  amount: number
  status: ProofStatus
  fileUrl: string | null
}

export interface ProofLineItem {
  name: string
  unitPrice: number
  quantity: number
}

export interface ProofDetail {
  proofId: number
  campaignId: number
  type: 'quote' | 'receipt'
  vendorId: number | null
  vendorName: string | null
  amount: number
  items: ProofLineItem[]
  status: ProofStatus
  fileUrl: string | null
  releaseTx: string | null
  createdAt: string
}

export interface Tier {
  tierId: number
  title: string
  price: number
  items: string[]
  limit: number | null
  soldCount: number
  remaining: number | null
}

export interface CreateTierInput {
  title: string
  price: number
  items: string[]
  limit?: number | null
}

export interface Vendor {
  id: number
  name: string
  category: string
  walletAddress: string
  contact: string | null
  allowlisted: boolean
}

export interface RegisterVendorInput {
  name: string
  walletAddress: string
  category: string
  contact?: string
}

export interface RegisterVendorResult {
  id: number
  allowlisted: boolean
  apiKey: string
}

export interface QuoteSubmitInput {
  campaignId: number
  items: ProofLineItem[]
  totalAmount: number
  fileUrl: string
}

export interface Settlement {
  campaignId: number
  status: CampaignStatus
  raisedAmount: number
  releasedAmount: number
  refundedAmount: number
  remainingInEscrow: number
  escrowPda: string | null
  aiReviewBudget: number | null
  aiReviewCost: number
  aiReceipts: { resource: string; amount: number; txSignature: string }[]
}

export interface BreakdownRow {
  userId: number | null
  walletAddress: string
  contributed: number
  refunded: number
  ratio: number
}

export interface PayshUsageItem {
  resource: string
  amount: number
  paid: boolean
  txSignature: string | null
  at: string
}

export interface PayshUsage {
  campaignId: number
  totalSpent: number
  items: PayshUsageItem[]
}

export type AgentRole = 'orchestrator' | 'vendor-negotiation' | 'verify-audit' | 'settlement-refund'

export type AgentState = 'idle' | 'running' | 'waiting'

export interface AgentLastDecision {
  decision: 'approve' | 'reject'
  reason: string | null
  at: string
}

export interface AgentStatusItem {
  role: AgentRole
  state: AgentState
  lastDecision?: AgentLastDecision | null
}

export interface AgentDecision {
  at: string
  agent: AgentRole
  action: string
  result: 'approve' | 'reject' | 'execute' | 'info'
  reason: string
}

export interface EvaluateResult {
  decision: 'approve' | 'reject'
  requiredAmount: number
  reasons: string[]
  readFile: boolean
  model: string
  micropay: {
    paid: boolean
    txSignature?: string
    amount?: number
    campaignSpent?: number
    campaignBudget?: number | null
    reason?: string
  }
  execution: {
    executed: boolean
    txSignature?: string
    releasedAmount?: number
    reason?: string
  } | null
}

export interface AuditResult {
  passed: boolean
  flagged: { proofId: number; vendorId: number; reason: string }[]
  checkedCount: number
}

export interface CreateCampaignInput {
  title: string
  category: string
  goalAmount: number
  deadline: string
  policy: CampaignPolicy
}

export interface UpdateCampaignInput {
  title?: string
  deadline?: string
  policy?: CampaignPolicy
}

export interface CreateCampaignResult {
  id: number
  escrowPda: string
  status: CampaignStatus
}

export interface CloseCampaignResult {
  status: CampaignStatus
  txSignature?: string
}

export interface PayQr {
  reference: string
  url: string
  amount: number
}

export interface PayStatus {
  reference: string
  status: 'pending' | 'confirmed'
  txSignature?: string | null
}

export interface RecordContributionResult {
  contributionId: number
  amount: number
}

export interface User {
  id: number
  name: string
  email: string
  walletAddress?: string | null
  bio?: string | null
  avatarUrl?: string | null
}

export interface UpdateProfileInput {
  name?: string
  bio?: string
  avatarUrl?: string
}

export interface MyContribution {
  campaignId: number
  title: string
  amount: number
  currency: string
  status: CampaignStatus
  createdAt: string
}

export interface Certificate {
  mintAddress: string
  campaignId: number
  campaignTitle: string
  imageUrl: string | null
  issuedAt: string
}

export interface AuthResult {
  accessToken: string
  refreshToken: string
  user: User
}

export interface CampaignListFilter {
  status?: CampaignStatus
  category?: string
}

export interface ApiClient {
  signup(email: string, password: string, name: string): Promise<AuthResult>
  login(email: string, password: string): Promise<AuthResult>
  logout(refreshToken: string): Promise<void>
  walletNonce(walletAddress: string): Promise<string>
  walletConnect(walletAddress: string, signature: string, nonce: string): Promise<string>
  walletLogin(walletAddress: string, signature: string, nonce: string): Promise<AuthResult>
  getMe(): Promise<User>
  updateMe(input: UpdateProfileInput): Promise<void>
  getMyContributions(): Promise<MyContribution[]>
  getMyCertificates(): Promise<Certificate[]>
  withdraw(): Promise<void>
  listCampaigns(filter?: CampaignListFilter): Promise<CampaignSummary[]>
  getCampaign(id: number): Promise<CampaignDetail>
  getCampaignStatus(id: number): Promise<CampaignProgress>
  getContributions(id: number): Promise<ContributionList>
  getQuotes(id: number): Promise<QuoteItem[]>
  createCampaign(input: CreateCampaignInput): Promise<CreateCampaignResult>
  updateCampaign(id: number, input: UpdateCampaignInput): Promise<void>
  closeCampaign(id: number): Promise<CloseCampaignResult>
  getTiers(campaignId: number): Promise<Tier[]>
  createTier(campaignId: number, input: CreateTierInput): Promise<number>
  createPayQr(campaignId: number, amount: number | null, tierId?: number): Promise<PayQr>
  getPayStatus(reference: string): Promise<PayStatus>
  recordContribution(reference: string, txSignature: string): Promise<RecordContributionResult>
  getPayshUsage(campaignId: number): Promise<PayshUsage>
  listVendors(allowlisted?: boolean): Promise<Vendor[]>
  registerVendor(input: RegisterVendorInput): Promise<RegisterVendorResult>
  getProof(proofId: number): Promise<ProofDetail>
  getSettlement(campaignId: number): Promise<Settlement>
  getBreakdown(campaignId: number): Promise<BreakdownRow[]>
  evaluatePolicy(campaignId: number, proofId: number): Promise<EvaluateResult>
  runAudit(campaignId: number): Promise<AuditResult>
  getAgentStatus(campaignId?: number): Promise<AgentStatusItem[]>
  getDecisions(campaignId: number): Promise<AgentDecision[]>
  uploadProofFile(apiKey: string, file: File): Promise<string>
  submitQuote(apiKey: string, vendorId: number, input: QuoteSubmitInput): Promise<number>
  submitReceipt(apiKey: string, input: QuoteSubmitInput): Promise<number>
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
