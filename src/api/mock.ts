import { ApiError } from './types'
import type {
  AgentDecision,
  AgentStatusItem,
  ApiClient,
  CampaignDetail,
  CampaignPolicy,
  Certificate,
  Contribution,
  PayshUsageItem,
  PayStatus,
  ProofDetail,
  QuoteItem,
  Tier,
  User,
  Vendor,
} from './types'

const USDC = 1_000_000

function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString()
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

function fakeBase58(length: number): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

interface MockCampaign extends CampaignDetail {
  ownerId: number
  contributorCount: number
  releasedAmount: number
  refundedAmount: number
}

let nextCampaignId = 5
let nextContributionId = 900
let nextUserId = 2
let nextVendorId = 20
let nextProofId = 100
let nextTierId = 10

const policies: Record<number, CampaignPolicy> = {
  1: {
    categories: { 생일카페: { maxUnitPrice: 12_000 * USDC, maxTotal: 28_000 * USDC, unitLabel: '1주 대관' } },
    aiReviewBudget: 20 * USDC,
  },
  2: {
    categories: { 지하철광고: { maxUnitPrice: 45_000 * USDC, maxTotal: 48_000 * USDC, unitLabel: '2주 1면' } },
    allowSurplusScaling: true,
    aiReviewBudget: 30 * USDC,
  },
}

const campaigns: MockCampaign[] = [
  {
    id: 1,
    title: '아이돌 OO 생일카페',
    category: '생일카페',
    goalAmount: 30_000 * USDC,
    raisedAmount: 12_000 * USDC,
    deadline: isoDaysFromNow(19),
    status: '모금중',
    escrowPda: 'Es1kQzX7hV9pTnR4uW2mJcYbA8dF6gHsLoPeMiN3vKua',
    policy: policies[1],
    ownerId: 1,
    contributorCount: 400,
    releasedAmount: 0,
    refundedAmount: 0,
  },
  {
    id: 2,
    title: 'OO 데뷔 5주년 지하철 광고',
    category: '지하철광고',
    goalAmount: 50_000 * USDC,
    raisedAmount: 50_000 * USDC,
    deadline: isoDaysAgo(2),
    status: '집행중',
    escrowPda: 'Es2rTn8kWm4XvBqJ5cYdA7fG9hLsPuoeNiM6zKxaQpVb',
    policy: policies[2],
    ownerId: 1,
    contributorCount: 812,
    releasedAmount: 21_000 * USDC,
    refundedAmount: 0,
  },
  {
    id: 3,
    title: 'OO 콘서트 서포트 쌀화환',
    category: '서포트',
    goalAmount: 8_000 * USDC,
    raisedAmount: 3_100 * USDC,
    deadline: isoDaysAgo(1),
    status: '환불중',
    escrowPda: 'Es3mVu6jXp2YwCqK4dZeB8gH1iLtRnofPjN7aKybSqWc',
    ownerId: 9,
    contributorCount: 96,
    releasedAmount: 0,
    refundedAmount: 1_200 * USDC,
  },
  {
    id: 4,
    title: 'OO 팬미팅 응원 전광판',
    category: '전광판',
    goalAmount: 15_000 * USDC,
    raisedAmount: 15_000 * USDC,
    deadline: isoDaysAgo(30),
    status: '종료',
    escrowPda: 'Es4pWv5iYq3ZxDrL6eAfC9hJ2kMuSnogQkP8bLzcTrXd',
    ownerId: 9,
    contributorCount: 233,
    releasedAmount: 15_000 * USDC,
    refundedAmount: 0,
  },
]

const contributionsByCampaign = new Map<number, Contribution[]>([
  [
    1,
    [
      { userId: 21, name: '별빛총총', amount: 30 * USDC, txSignature: fakeBase58(88), createdAt: isoDaysAgo(0.2) },
      { userId: 22, name: 'ooo_fan', amount: 100 * USDC, txSignature: fakeBase58(88), createdAt: isoDaysAgo(0.6) },
      { userId: 23, name: '민지언니', amount: 50 * USDC, txSignature: fakeBase58(88), createdAt: isoDaysAgo(1.1) },
      { userId: 24, name: '데이지', amount: 30 * USDC, txSignature: fakeBase58(88), createdAt: isoDaysAgo(1.4) },
      { userId: 25, name: 'sunny', amount: 20 * USDC, txSignature: fakeBase58(88), createdAt: isoDaysAgo(2.3) },
      { userId: 26, name: '한강뷰', amount: 300 * USDC, txSignature: fakeBase58(88), createdAt: isoDaysAgo(3.0) },
    ],
  ],
  [
    2,
    [
      { userId: 1, name: '총대님', amount: 200 * USDC, txSignature: fakeBase58(88), createdAt: isoDaysAgo(4) },
      { userId: 32, name: '역삼동주민', amount: 60 * USDC, txSignature: fakeBase58(88), createdAt: isoDaysAgo(5) },
    ],
  ],
])

interface MockVendor extends Vendor {
  apiKey: string
}

const vendors: MockVendor[] = [
  {
    id: 7,
    name: 'OO광고기획',
    category: '지하철광고',
    walletAddress: fakeBase58(44),
    contact: 'ad@example.com',
    allowlisted: true,
    apiKey: 'mock-vendor-key-7',
  },
  {
    id: 8,
    name: '지하철미디어랩',
    category: '지하철광고',
    walletAddress: fakeBase58(44),
    contact: null,
    allowlisted: true,
    apiKey: 'mock-vendor-key-8',
  },
  {
    id: 12,
    name: '카페모먼트',
    category: '생일카페',
    walletAddress: fakeBase58(44),
    contact: '010-0000-0000',
    allowlisted: true,
    apiKey: 'mock-vendor-key-12',
  },
]

interface MockProof extends ProofDetail {
  campaignId: number
}

const proofs: MockProof[] = [
  {
    proofId: 34,
    campaignId: 2,
    type: 'quote',
    vendorId: 7,
    vendorName: 'OO광고기획',
    amount: 42_000 * USDC,
    items: [
      { name: '2호선 강남역 스크린도어 2주', unitPrice: 21_000 * USDC, quantity: 2 },
    ],
    status: '승인',
    fileUrl: 'https://storage.example.com/quotes/34.pdf',
    releaseTx: fakeBase58(88),
    createdAt: isoDaysAgo(2.5),
  },
  {
    proofId: 35,
    campaignId: 2,
    type: 'quote',
    vendorId: 8,
    vendorName: '지하철미디어랩',
    amount: 47_500 * USDC,
    items: [{ name: '2호선 홍대입구역 조명광고 2주', unitPrice: 47_500 * USDC, quantity: 1 }],
    status: '거절',
    fileUrl: 'https://storage.example.com/quotes/35.pdf',
    releaseTx: null,
    createdAt: isoDaysAgo(2.7),
  },
  {
    proofId: 41,
    campaignId: 2,
    type: 'receipt',
    vendorId: 7,
    vendorName: 'OO광고기획',
    amount: 21_000 * USDC,
    items: [{ name: '1차 집행분 정산', unitPrice: 21_000 * USDC, quantity: 1 }],
    status: '검토중',
    fileUrl: 'https://storage.example.com/receipts/41.pdf',
    releaseTx: null,
    createdAt: isoDaysAgo(0.7),
  },
  {
    proofId: 51,
    campaignId: 1,
    type: 'quote',
    vendorId: 12,
    vendorName: '카페모먼트',
    amount: 9_800 * USDC,
    items: [
      { name: '카페 대관 1주', unitPrice: 8_000 * USDC, quantity: 1 },
      { name: '컵홀더 제작 1,000개', unitPrice: 1_800 * USDC, quantity: 1 },
    ],
    status: '검토중',
    fileUrl: 'https://storage.example.com/quotes/51.pdf',
    releaseTx: null,
    createdAt: isoDaysAgo(1.2),
  },
]

const tiersByCampaign = new Map<number, Tier[]>([
  [
    1,
    [
      { tierId: 1, title: '기본 응원', price: 10 * USDC, items: ['포토카드 1종'], limit: null, soldCount: 180, remaining: null },
      { tierId: 2, title: '컵홀더 세트', price: 30 * USDC, items: ['포토카드 1종', '컵홀더 2종'], limit: 300, soldCount: 141, remaining: 159 },
      { tierId: 3, title: '스페셜 키트', price: 100 * USDC, items: ['포토카드 풀세트', '컵홀더 2종', '아크릴 스탠드'], limit: 50, soldCount: 22, remaining: 28 },
    ],
  ],
])

const usageByCampaign = new Map<number, PayshUsageItem[]>([
  [
    2,
    [
      { resource: 'gemini-2.5-flash', amount: 2 * USDC, paid: true, txSignature: fakeBase58(88), at: isoDaysAgo(0.5) },
      { resource: 'gemini-2.5-flash', amount: 2 * USDC, paid: true, txSignature: fakeBase58(88), at: isoDaysAgo(2.2) },
    ],
  ],
  [
    1,
    [{ resource: 'gemini-2.5-flash', amount: 2 * USDC, paid: true, txSignature: fakeBase58(88), at: isoDaysAgo(0.8) }],
  ],
])

const decisionsByCampaign = new Map<number, AgentDecision[]>([
  [
    1,
    [
      {
        at: isoDaysAgo(0.1),
        agent: 'orchestrator',
        action: 'policy-check',
        result: 'info',
        reason: '모금률 40% — 목표 미달, 집행 보류 유지',
      },
      {
        at: isoDaysAgo(0.8),
        agent: 'verify-audit',
        action: 'verify',
        result: 'approve',
        reason: '카페모먼트 견적서 항목·단가가 정책 한도 이내',
      },
      {
        at: isoDaysAgo(1.2),
        agent: 'vendor-negotiation',
        action: 'negotiate',
        result: 'info',
        reason: '카페모먼트에 대관료 5% 조정 제안 발송 (A2A)',
      },
    ],
  ],
  [
    2,
    [
      {
        at: isoDaysAgo(0.5),
        agent: 'settlement-refund',
        action: 'release',
        result: 'execute',
        reason: '1차 집행 21,000 USDC → OO광고기획 (allowlist 확인)',
      },
      {
        at: isoDaysAgo(1.5),
        agent: 'verify-audit',
        action: 'verify',
        result: 'approve',
        reason: '영수증 금액 ↔ 집행 요청 금액 일치',
      },
      {
        at: isoDaysAgo(2.0),
        agent: 'vendor-negotiation',
        action: 'negotiate',
        result: 'approve',
        reason: '최종 견적 42,000 USDC 합의 — 목표 단가 이내',
      },
      {
        at: isoDaysAgo(2.2),
        agent: 'orchestrator',
        action: 'policy-check',
        result: 'approve',
        reason: '목표 달성·마감 도래 — 집행 단계 전환 승인',
      },
    ],
  ],
  [
    3,
    [
      {
        at: isoDaysAgo(0.9),
        agent: 'settlement-refund',
        action: 'refund',
        result: 'execute',
        reason: '목표 미달 마감 — 기여 96건 비율 환불 배치 시작',
      },
      {
        at: isoDaysAgo(1.0),
        agent: 'orchestrator',
        action: 'policy-check',
        result: 'reject',
        reason: '모금률 38.75% — 집행 불가, 환불 전환',
      },
    ],
  ],
])

interface MockAccount extends User {
  password: string
}

const accounts: MockAccount[] = [
  {
    id: 1,
    name: '총대님',
    email: 'fan@example.com',
    password: 'thisispassword',
    walletAddress: null,
    bio: '팬덤 프로젝트 총대 3년차',
    avatarUrl: null,
  },
]

const certificatesByUser = new Map<number, Certificate[]>([
  [
    1,
    [
      {
        mintAddress: fakeBase58(44),
        campaignId: 4,
        campaignTitle: 'OO 팬미팅 응원 전광판',
        imageUrl: null,
        issuedAt: isoDaysAgo(28),
      },
    ],
  ],
])

let currentUser: User | null = null

const nonces = new Map<string, string>()

interface PendingPayment {
  reference: string
  campaignId: number
  amount: number
  tierId?: number
  polls: number
  txSignature?: string
  recorded: boolean
}

const payments = new Map<string, PendingPayment>()

function issueTokens(user: User) {
  return {
    accessToken: `mock-access-${user.id}-${Date.now()}`,
    refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
    user,
  }
}

function toPublicUser(account: MockAccount): User {
  const { password: _p, ...user } = account
  return user
}

function findCampaign(id: number): MockCampaign {
  const campaign = campaigns.find((c) => c.id === id)
  if (!campaign) throw new ApiError(404, '존재하지 않는 캠페인입니다.')
  return campaign
}

function findAccount(): MockAccount {
  if (!currentUser) throw new ApiError(401, '로그인이 필요합니다.')
  const account = accounts.find((a) => a.id === currentUser?.id)
  if (!account) throw new ApiError(401, '로그인이 필요합니다.')
  return account
}

function findVendorByKey(apiKey: string): MockVendor {
  const vendor = vendors.find((v) => v.apiKey === apiKey)
  if (!vendor) throw new ApiError(401, '유효하지 않은 벤더 키입니다.')
  if (!vendor.allowlisted) throw new ApiError(403, 'allowlist에 등재되지 않은 벤더입니다.')
  return vendor
}

function pushDecision(campaignId: number, decision: AgentDecision): void {
  const list = decisionsByCampaign.get(campaignId) ?? []
  decisionsByCampaign.set(campaignId, [decision, ...list])
}

function toQuoteItem(proof: MockProof): QuoteItem {
  return {
    proofId: proof.proofId,
    type: proof.type,
    vendorId: proof.vendorId,
    vendorName: proof.vendorName,
    amount: proof.amount,
    status: proof.status,
    fileUrl: proof.fileUrl,
  }
}

export const mockApi: ApiClient = {
  async signup(email, password, name) {
    await delay()
    if (accounts.some((a) => a.email === email)) {
      throw new ApiError(409, '이미 사용 중인 이메일입니다.')
    }
    const user: MockAccount = {
      id: nextUserId,
      name,
      email,
      password,
      walletAddress: null,
      bio: null,
      avatarUrl: null,
    }
    nextUserId += 1
    accounts.push(user)
    currentUser = toPublicUser(user)
    return issueTokens(currentUser)
  },

  async login(email, password) {
    await delay()
    const account = accounts.find((a) => a.email === email && a.password === password)
    if (!account) throw new ApiError(401, '이메일 또는 비밀번호가 올바르지 않습니다.')
    currentUser = toPublicUser(account)
    return issueTokens(currentUser)
  },

  async logout() {
    await delay(120)
    currentUser = null
  },

  async walletNonce(walletAddress) {
    await delay(120)
    if (walletAddress.length < 32) throw new ApiError(400, '유효하지 않은 지갑 주소입니다.')
    const nonce = `chongdae-auth:${fakeBase58(32)}`
    nonces.set(walletAddress, nonce)
    return nonce
  },

  async walletConnect(walletAddress, _signature, nonce) {
    await delay()
    const account = findAccount()
    if (nonces.get(walletAddress) !== nonce) throw new ApiError(400, 'nonce가 만료되었거나 일치하지 않습니다.')
    nonces.delete(walletAddress)
    if (accounts.some((a) => a.walletAddress === walletAddress && a.id !== account.id)) {
      throw new ApiError(409, '이미 다른 계정에 연결된 지갑입니다.')
    }
    account.walletAddress = walletAddress
    currentUser = toPublicUser(account)
    return walletAddress
  },

  async walletLogin(walletAddress, _signature, nonce) {
    await delay()
    if (nonces.get(walletAddress) !== nonce) throw new ApiError(400, 'nonce가 만료되었거나 일치하지 않습니다.')
    nonces.delete(walletAddress)
    const account = accounts.find((a) => a.walletAddress === walletAddress)
    if (!account) throw new ApiError(401, '해당 지갑으로 연결된 계정이 없습니다.')
    currentUser = toPublicUser(account)
    return issueTokens(currentUser)
  },

  async getMe() {
    await delay(120)
    return toPublicUser(findAccount())
  },

  async updateMe(input) {
    await delay()
    const account = findAccount()
    if (input.name !== undefined) account.name = input.name
    if (input.bio !== undefined) account.bio = input.bio
    if (input.avatarUrl !== undefined) account.avatarUrl = input.avatarUrl
    currentUser = toPublicUser(account)
  },

  async getMyContributions() {
    await delay()
    const account = findAccount()
    const mine: { campaignId: number; contribution: Contribution }[] = []
    for (const [campaignId, list] of contributionsByCampaign) {
      for (const contribution of list) {
        if (contribution.userId === account.id) mine.push({ campaignId, contribution })
      }
    }
    return mine
      .map(({ campaignId, contribution }) => {
        const campaign = findCampaign(campaignId)
        return {
          campaignId,
          title: campaign.title,
          amount: contribution.amount,
          currency: 'USDC',
          status: campaign.status,
          createdAt: contribution.createdAt,
        }
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async getMyCertificates() {
    await delay()
    const account = findAccount()
    return certificatesByUser.get(account.id) ?? []
  },

  async withdraw() {
    await delay()
    const account = findAccount()
    if (campaigns.some((c) => c.ownerId === account.id && c.status !== '종료')) {
      throw new ApiError(409, '진행 중인 캠페인이 있어 탈퇴할 수 없습니다.')
    }
    accounts.splice(accounts.indexOf(account), 1)
    currentUser = null
  },

  async listCampaigns(filter) {
    await delay()
    return campaigns
      .filter((c) => (filter?.status ? c.status === filter.status : true))
      .filter((c) => (filter?.category ? c.category === filter.category : true))
      .map(({ id, title, category, goalAmount, raisedAmount, deadline, status }) => ({
        id,
        title,
        category,
        goalAmount,
        raisedAmount,
        deadline,
        status,
      }))
  },

  async getCampaign(id) {
    await delay()
    const campaign = findCampaign(id)
    return {
      id: campaign.id,
      title: campaign.title,
      category: campaign.category,
      goalAmount: campaign.goalAmount,
      raisedAmount: campaign.raisedAmount,
      deadline: campaign.deadline,
      status: campaign.status,
      escrowPda: campaign.escrowPda,
      policy: campaign.policy,
    }
  },

  async getCampaignStatus(id) {
    await delay(180)
    const campaign = findCampaign(id)
    const remaining = Math.floor((new Date(campaign.deadline).getTime() - Date.now()) / 1000)
    return {
      goalAmount: campaign.goalAmount,
      raisedAmount: campaign.raisedAmount,
      progressRate: Math.round((campaign.raisedAmount / campaign.goalAmount) * 1000) / 1000,
      contributorCount: campaign.contributorCount,
      remainingSeconds: Math.max(remaining, 0),
      status: campaign.status,
    }
  },

  async getContributions(id) {
    await delay()
    const campaign = findCampaign(id)
    const contributions = contributionsByCampaign.get(id) ?? []
    return { contributions, totalCount: campaign.contributorCount }
  },

  async getQuotes(id) {
    await delay()
    findCampaign(id)
    return proofs.filter((p) => p.campaignId === id).map(toQuoteItem)
  },

  async createCampaign(input) {
    await delay(700)
    if (!currentUser) throw new ApiError(401, '로그인이 필요합니다.')
    const campaign: MockCampaign = {
      id: nextCampaignId,
      title: input.title,
      category: input.category,
      goalAmount: input.goalAmount,
      raisedAmount: 0,
      deadline: input.deadline,
      status: '모금중',
      escrowPda: fakeBase58(44),
      policy: input.policy,
      ownerId: currentUser.id,
      contributorCount: 0,
      releasedAmount: 0,
      refundedAmount: 0,
    }
    nextCampaignId += 1
    campaigns.unshift(campaign)
    pushDecision(campaign.id, {
      at: new Date().toISOString(),
      agent: 'orchestrator',
      action: 'campaign-created',
      result: 'info',
      reason: 'escrow PDA 생성 완료 — 정책 로드, 모금 감시 시작',
    })
    return { id: campaign.id, escrowPda: campaign.escrowPda, status: campaign.status }
  },

  async updateCampaign(id, input) {
    await delay()
    if (!currentUser) throw new ApiError(401, '로그인이 필요합니다.')
    const campaign = findCampaign(id)
    if (campaign.ownerId !== currentUser.id) throw new ApiError(403, '수정 권한이 없습니다.')
    if (campaign.status !== '모금중' || campaign.raisedAmount > 0) {
      throw new ApiError(409, '이미 모금이 시작된 캠페인입니다.')
    }
    if (input.deadline !== undefined) {
      if (new Date(input.deadline).getTime() > new Date(campaign.deadline).getTime()) {
        throw new ApiError(400, '마감일은 앞당기기만 허용됩니다.')
      }
      campaign.deadline = input.deadline
    }
    if (input.title !== undefined) campaign.title = input.title
    if (input.policy !== undefined) campaign.policy = input.policy
  },

  async closeCampaign(id) {
    await delay(600)
    if (!currentUser) throw new ApiError(401, '로그인이 필요합니다.')
    const campaign = findCampaign(id)
    if (campaign.status !== '모금중') throw new ApiError(409, '이미 마감된 캠페인입니다.')
    const goalReached = campaign.raisedAmount >= campaign.goalAmount
    if (goalReached) campaign.status = '집행중'
    else if (campaign.contributorCount > 0) campaign.status = '환불중'
    else campaign.status = '종료'
    pushDecision(id, {
      at: new Date().toISOString(),
      agent: 'orchestrator',
      action: 'close',
      result: goalReached ? 'approve' : 'reject',
      reason: goalReached
        ? '조기 마감 — 목표 달성, 집행 단계 전환'
        : '조기 마감 — 목표 미달, 환불 절차 시작',
    })
    return { status: campaign.status, txSignature: fakeBase58(88) }
  },

  async getTiers(campaignId) {
    await delay()
    findCampaign(campaignId)
    return tiersByCampaign.get(campaignId) ?? []
  },

  async createTier(campaignId, input) {
    await delay()
    if (!currentUser) throw new ApiError(401, '로그인이 필요합니다.')
    const campaign = findCampaign(campaignId)
    if (campaign.ownerId !== currentUser.id) throw new ApiError(403, '수정 권한이 없습니다.')
    if (campaign.status !== '모금중') throw new ApiError(409, '이미 마감된 캠페인입니다.')
    const tier: Tier = {
      tierId: nextTierId,
      title: input.title,
      price: input.price,
      items: input.items,
      limit: input.limit ?? null,
      soldCount: 0,
      remaining: input.limit ?? null,
    }
    nextTierId += 1
    const list = tiersByCampaign.get(campaignId) ?? []
    list.push(tier)
    list.sort((a, b) => a.price - b.price)
    tiersByCampaign.set(campaignId, list)
    return tier.tierId
  },

  async createPayQr(campaignId, amount, tierId) {
    await delay(400)
    const campaign = findCampaign(campaignId)
    if (campaign.status !== '모금중') throw new ApiError(409, '이미 마감된 캠페인입니다.')
    let payAmount = amount ?? 0
    if (tierId !== undefined) {
      const tier = (tiersByCampaign.get(campaignId) ?? []).find((t) => t.tierId === tierId)
      if (!tier) throw new ApiError(400, '존재하지 않는 티어입니다.')
      if (tier.remaining !== null && tier.remaining <= 0) throw new ApiError(409, '품절된 티어입니다.')
      payAmount = tier.price
    }
    if (payAmount <= 0) throw new ApiError(400, '금액 또는 티어를 지정해야 합니다.')
    const reference = fakeBase58(44)
    payments.set(reference, { reference, campaignId, amount: payAmount, tierId, polls: 0, recorded: false })
    return {
      reference,
      url: `solana:https://demo.chongdae.dev/payment/solana-pay/tx?ref=${reference}`,
      amount: payAmount,
    }
  },

  async getPayStatus(reference) {
    await delay(150)
    const payment = payments.get(reference)
    if (!payment) throw new ApiError(404, '존재하지 않는 결제 요청입니다.')
    payment.polls += 1
    if (payment.polls < 4) {
      return { reference, status: 'pending' } satisfies PayStatus
    }
    if (!payment.txSignature) payment.txSignature = fakeBase58(88)
    return { reference, status: 'confirmed', txSignature: payment.txSignature }
  },

  async recordContribution(reference, txSignature) {
    await delay(300)
    if (!currentUser) throw new ApiError(401, '로그인이 필요합니다.')
    const payment = payments.get(reference)
    if (!payment) throw new ApiError(400, '트랜잭션 검증에 실패했습니다.')
    if (payment.recorded) throw new ApiError(409, '이미 처리된 트랜잭션입니다.')
    payment.recorded = true
    const campaign = findCampaign(payment.campaignId)
    campaign.raisedAmount += payment.amount
    campaign.contributorCount += 1
    if (payment.tierId !== undefined) {
      const tier = (tiersByCampaign.get(campaign.id) ?? []).find((t) => t.tierId === payment.tierId)
      if (tier) {
        tier.soldCount += 1
        if (tier.remaining !== null) tier.remaining -= 1
      }
    }
    const list = contributionsByCampaign.get(campaign.id) ?? []
    list.unshift({
      userId: currentUser.id,
      name: currentUser.name,
      amount: payment.amount,
      txSignature,
      createdAt: new Date().toISOString(),
    })
    contributionsByCampaign.set(campaign.id, list)
    const contributionId = nextContributionId
    nextContributionId += 1
    return { contributionId, amount: payment.amount }
  },

  async getPayshUsage(campaignId) {
    await delay()
    findCampaign(campaignId)
    const items = usageByCampaign.get(campaignId) ?? []
    return {
      campaignId,
      totalSpent: items.filter((i) => i.paid).reduce((sum, i) => sum + i.amount, 0),
      items,
    }
  },

  async listVendors(allowlisted) {
    await delay()
    return vendors
      .filter((v) => (allowlisted === undefined ? true : v.allowlisted === allowlisted))
      .map(({ apiKey: _k, ...vendor }) => vendor)
  },

  async registerVendor(input) {
    await delay(400)
    if (vendors.some((v) => v.walletAddress === input.walletAddress)) {
      throw new ApiError(409, '이미 등록된 벤더입니다.')
    }
    const vendor: MockVendor = {
      id: nextVendorId,
      name: input.name,
      category: input.category,
      walletAddress: input.walletAddress,
      contact: input.contact ?? null,
      allowlisted: true,
      apiKey: `mock-vendor-key-${nextVendorId}`,
    }
    nextVendorId += 1
    vendors.push(vendor)
    return { id: vendor.id, allowlisted: vendor.allowlisted, apiKey: vendor.apiKey }
  },

  async getProof(proofId) {
    await delay()
    const proof = proofs.find((p) => p.proofId === proofId)
    if (!proof) throw new ApiError(404, '존재하지 않는 증빙입니다.')
    return proof
  },

  async getSettlement(campaignId) {
    await delay()
    const campaign = findCampaign(campaignId)
    const receipts = (usageByCampaign.get(campaignId) ?? []).filter((i) => i.paid)
    return {
      campaignId,
      status: campaign.status,
      raisedAmount: campaign.raisedAmount,
      releasedAmount: campaign.releasedAmount,
      refundedAmount: campaign.refundedAmount,
      remainingInEscrow: campaign.raisedAmount - campaign.releasedAmount - campaign.refundedAmount,
      escrowPda: campaign.escrowPda,
      aiReviewBudget: campaign.policy?.aiReviewBudget ?? null,
      aiReviewCost: receipts.reduce((sum, i) => sum + i.amount, 0),
      aiReceipts: receipts.map((i) => ({
        resource: i.resource,
        amount: i.amount,
        txSignature: i.txSignature ?? '',
      })),
    }
  },

  async getBreakdown(campaignId) {
    await delay()
    const campaign = findCampaign(campaignId)
    const list = contributionsByCampaign.get(campaignId) ?? []
    const refunded = campaign.status === '환불중' || campaign.refundedAmount > 0
    return list
      .map((c) => ({
        userId: c.userId,
        walletAddress: `${fakeBase58(4)}…${fakeBase58(4)}`,
        contributed: c.amount,
        refunded: refunded ? c.amount : 0,
        ratio: campaign.raisedAmount > 0 ? Math.round((c.amount / campaign.raisedAmount) * 1e6) / 1e6 : 0,
      }))
      .sort((a, b) => b.contributed - a.contributed)
  },

  async evaluatePolicy(campaignId, proofId) {
    await delay(2500)
    if (!currentUser) throw new ApiError(401, '로그인이 필요합니다.')
    const campaign = findCampaign(campaignId)
    if (campaign.ownerId !== currentUser.id) throw new ApiError(403, '해당 캠페인의 총대만 요청할 수 있습니다.')
    const proof = proofs.find((p) => p.proofId === proofId && p.campaignId === campaignId)
    if (!proof) throw new ApiError(404, '존재하지 않는 증빙입니다.')
    if (proof.type === 'receipt') throw new ApiError(409, '영수증 증빙은 정책 심사 대상이 아닙니다.')
    if (proof.releaseTx) throw new ApiError(409, '이미 집행된 증빙은 다시 심사할 수 없습니다.')

    const remaining = campaign.raisedAmount - campaign.releasedAmount - campaign.refundedAmount
    const withinBalance = proof.amount <= remaining
    const categoryPolicy = campaign.policy?.categories?.[campaign.category]
    const withinTotal = !categoryPolicy?.maxTotal || proof.amount <= categoryPolicy.maxTotal
    const approve = withinBalance && withinTotal

    proof.status = approve ? '승인' : '거절'
    const reasons = approve
      ? ['견적 항목·단가가 캠페인 정책 한도 이내', '벤더 allowlist 확인 완료', '에스크로 잔액 내 집행 가능']
      : [
          withinBalance ? '카테고리 총액 한도 초과' : '에스크로 잔액 부족',
          '정책 위반으로 집행 불가',
        ]
    const micropayTx = fakeBase58(88)
    const usageList = usageByCampaign.get(campaignId) ?? []
    usageList.unshift({
      resource: 'gemini-2.5-flash',
      amount: 2 * USDC,
      paid: true,
      txSignature: micropayTx,
      at: new Date().toISOString(),
    })
    usageByCampaign.set(campaignId, usageList)

    let execution: { executed: boolean; txSignature?: string; releasedAmount?: number; reason?: string } | null =
      null
    if (approve) {
      if (campaign.status === '집행중') {
        proof.releaseTx = fakeBase58(88)
        campaign.releasedAmount += proof.amount
        execution = { executed: true, txSignature: proof.releaseTx, releasedAmount: proof.amount }
      } else {
        execution = { executed: false, reason: '모금 진행 중 — 마감 후 집행됩니다.' }
      }
    }

    pushDecision(campaignId, {
      at: new Date().toISOString(),
      agent: 'verify-audit',
      action: `증빙 #${proofId}`,
      result: approve ? 'approve' : 'reject',
      reason: reasons.join(' · '),
    })
    if (execution?.executed) {
      pushDecision(campaignId, {
        at: new Date().toISOString(),
        agent: 'settlement-refund',
        action: `증빙 #${proofId}`,
        result: 'execute',
        reason: `${proof.vendorName ?? '벤더'}에게 집행 완료 (allowlist 확인)`,
      })
    }

    return {
      decision: approve ? 'approve' : 'reject',
      requiredAmount: withinBalance ? 0 : proof.amount - remaining,
      reasons,
      readFile: true,
      model: 'gemini-2.5-flash',
      micropay: {
        paid: true,
        txSignature: micropayTx,
        amount: 2 * USDC,
        campaignSpent: usageList.filter((i) => i.paid).reduce((sum, i) => sum + i.amount, 0),
        campaignBudget: campaign.policy?.aiReviewBudget ?? null,
      },
      execution,
    }
  },

  async runAudit(campaignId) {
    await delay(1200)
    if (!currentUser) throw new ApiError(401, '로그인이 필요합니다.')
    const campaign = findCampaign(campaignId)
    if (campaign.ownerId !== currentUser.id) throw new ApiError(403, '해당 캠페인의 총대만 요청할 수 있습니다.')
    const receipts = proofs.filter((p) => p.campaignId === campaignId && p.type === 'receipt')
    const flagged: { proofId: number; vendorId: number; reason: string }[] = []
    for (const receipt of receipts) {
      if (receipt.status === '검토중') receipt.status = '승인'
    }
    pushDecision(campaignId, {
      at: new Date().toISOString(),
      agent: 'verify-audit',
      action: 'audit',
      result: flagged.length === 0 ? 'approve' : 'reject',
      reason:
        flagged.length === 0
          ? `영수증 ${receipts.length}건 전수 대조 — 집행 내역과 전부 일치`
          : `불일치 ${flagged.length}건 — 해당 벤더 allowlist 차단`,
    })
    return { passed: flagged.length === 0, flagged, checkedCount: receipts.length }
  },

  async getAgentStatus(campaignId) {
    await delay(200)
    const campaign = campaignId !== undefined ? findCampaign(campaignId) : null
    const states: Record<string, AgentStatusItem[]> = {
      모금중: [
        { role: 'orchestrator', state: 'running' },
        { role: 'vendor-negotiation', state: 'running' },
        { role: 'verify-audit', state: 'idle' },
        { role: 'settlement-refund', state: 'waiting' },
      ],
      집행중: [
        { role: 'orchestrator', state: 'running' },
        { role: 'vendor-negotiation', state: 'idle' },
        { role: 'verify-audit', state: 'running' },
        { role: 'settlement-refund', state: 'running' },
      ],
      환불중: [
        { role: 'orchestrator', state: 'running' },
        { role: 'vendor-negotiation', state: 'idle' },
        { role: 'verify-audit', state: 'idle' },
        { role: 'settlement-refund', state: 'running' },
      ],
      종료: [
        { role: 'orchestrator', state: 'idle' },
        { role: 'vendor-negotiation', state: 'idle' },
        { role: 'verify-audit', state: 'idle' },
        { role: 'settlement-refund', state: 'idle' },
      ],
    }
    const items = states[campaign?.status ?? '모금중']
    if (campaign) {
      const decisions = decisionsByCampaign.get(campaign.id) ?? []
      return items.map((item) => {
        const last = decisions.find((d) => d.agent === item.role && d.result !== 'info')
        return {
          ...item,
          lastDecision: last
            ? { decision: last.result === 'reject' ? 'reject' : 'approve', reason: last.reason, at: last.at }
            : null,
        }
      })
    }
    return items
  },

  async getDecisions(campaignId) {
    await delay()
    findCampaign(campaignId)
    return decisionsByCampaign.get(campaignId) ?? []
  },

  async uploadProofFile(apiKey, file) {
    await delay(600)
    findVendorByKey(apiKey)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
    return `https://storage.example.com/uploads/${fakeBase58(16)}.${ext}`
  },

  async submitQuote(apiKey, vendorId, input) {
    await delay(500)
    const vendor = findVendorByKey(apiKey)
    if (vendor.id !== vendorId) throw new ApiError(401, '벤더 정보가 일치하지 않습니다.')
    const campaign = findCampaign(input.campaignId)
    if (campaign.status !== '모금중') throw new ApiError(409, '이미 마감된 캠페인입니다.')
    const itemsTotal = input.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    if (itemsTotal !== input.totalAmount) {
      throw new ApiError(400, `신고 총액 ${input.totalAmount}가 항목 합계 ${itemsTotal}와 다릅니다.`)
    }
    const proof: MockProof = {
      proofId: nextProofId,
      campaignId: input.campaignId,
      type: 'quote',
      vendorId: vendor.id,
      vendorName: vendor.name,
      amount: input.totalAmount,
      items: input.items,
      status: '검토중',
      fileUrl: input.fileUrl,
      releaseTx: null,
      createdAt: new Date().toISOString(),
    }
    nextProofId += 1
    proofs.unshift(proof)
    return proof.proofId
  },

  async submitReceipt(apiKey, input) {
    await delay(500)
    const vendor = findVendorByKey(apiKey)
    findCampaign(input.campaignId)
    const itemsTotal = input.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    if (itemsTotal !== input.totalAmount) {
      throw new ApiError(400, `신고 총액 ${input.totalAmount}가 항목 합계 ${itemsTotal}와 다릅니다.`)
    }
    const proof: MockProof = {
      proofId: nextProofId,
      campaignId: input.campaignId,
      type: 'receipt',
      vendorId: vendor.id,
      vendorName: vendor.name,
      amount: input.totalAmount,
      items: input.items,
      status: '검토중',
      fileUrl: input.fileUrl,
      releaseTx: null,
      createdAt: new Date().toISOString(),
    }
    nextProofId += 1
    proofs.unshift(proof)
    return proof.proofId
  },
}
