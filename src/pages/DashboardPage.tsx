import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import type {
  AgentDecision,
  AgentStatusItem,
  CampaignSummary,
  EvaluateResult,
  QuoteItem,
  Settlement,
  Tier,
} from '../api'
import { explorerTxUrl, formatDateTime, formatUsdc, progressPercent, remainingUntil, shortAddress, toRawUnits } from '../lib/format'
import { Card, EmptyNote, ErrorNote, ProgressBar, ProofBadge, Spinner, StatusBadge, metaFor } from '../components/ui'
import { useAuth } from '../store/auth'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<CampaignSummary[] | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [agents, setAgents] = useState<AgentStatusItem[] | null>(null)
  const [decisions, setDecisions] = useState<AgentDecision[] | null>(null)
  const [quotes, setQuotes] = useState<QuoteItem[] | null>(null)
  const [settlement, setSettlement] = useState<Settlement | null>(null)
  const [tiers, setTiers] = useState<Tier[] | null>(null)
  const [closing, setClosing] = useState(false)
  const [evaluatingId, setEvaluatingId] = useState<number | null>(null)
  const [evalResult, setEvalResult] = useState<{ proofId: number; result: EvaluateResult } | null>(null)
  const [auditing, setAuditing] = useState(false)
  const [auditNote, setAuditNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) navigate('/login', { state: { from: '/dashboard' } })
  }, [user, navigate])

  const loadCampaigns = useCallback(async () => {
    const list = await api.listCampaigns()
    setCampaigns(list)
    setSelectedId((prev) => prev ?? list[0]?.id ?? null)
  }, [])

  useEffect(() => {
    if (user) {
      loadCampaigns().catch((e: Error) => {
        setCampaigns([])
        setError(e.message)
      })
    }
  }, [user, loadCampaigns])

  const loadDetail = useCallback(async (campaignId: number) => {
    const [a, d, q, s, t] = await Promise.all([
      api.getAgentStatus(campaignId),
      api.getDecisions(campaignId),
      api.getQuotes(campaignId),
      api.getSettlement(campaignId),
      api.getTiers(campaignId),
    ])
    setAgents(a)
    setDecisions(d)
    setQuotes(q)
    setSettlement(s)
    setTiers(t)
  }, [])

  useEffect(() => {
    if (selectedId === null) return
    let alive = true
    setAgents(null)
    setDecisions(null)
    setQuotes(null)
    setSettlement(null)
    setTiers(null)
    setEvalResult(null)
    setAuditNote(null)
    void loadDetail(selectedId).catch((e: Error) => {
      if (alive) setError(e.message)
    })
    return () => {
      alive = false
    }
  }, [selectedId, loadDetail])

  const selected = campaigns?.find((c) => c.id === selectedId) ?? null

  async function handleClose() {
    if (!selected) return
    if (!window.confirm(`'${selected.title}' 캠페인을 조기 마감할까요?`)) return
    setClosing(true)
    setError(null)
    try {
      await api.closeCampaign(selected.id)
      await loadCampaigns()
      await loadDetail(selected.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : '마감에 실패했습니다.')
    } finally {
      setClosing(false)
    }
  }

  async function handleEvaluate(proofId: number) {
    if (!selected) return
    setEvaluatingId(proofId)
    setEvalResult(null)
    setError(null)
    try {
      const result = await api.evaluatePolicy(selected.id, proofId)
      setEvalResult({ proofId, result })
      await loadDetail(selected.id)
      await loadCampaigns()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 심사에 실패했습니다.')
    } finally {
      setEvaluatingId(null)
    }
  }

  async function handleAudit() {
    if (!selected) return
    setAuditing(true)
    setAuditNote(null)
    setError(null)
    try {
      const result = await api.runAudit(selected.id)
      setAuditNote(
        result.passed
          ? `감사 통과 — 영수증 ${result.checkedCount}건 전수 대조 완료, 불일치 없음`
          : `불일치 ${result.flagged.length}건 발견 — 해당 벤더 allowlist 자동 차단: ${result.flagged
              .map((f) => `증빙 #${f.proofId} (${f.reason})`)
              .join(', ')}`,
      )
      await loadDetail(selected.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : '감사 실행에 실패했습니다.')
    } finally {
      setAuditing(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">총대 대시보드</h1>
          <p className="mt-1 text-sm text-mute">
            집행 버튼은 없습니다 — 에이전트가 정책대로 집행하고, 총대는 상태만 봅니다
          </p>
        </div>
        <Link
          to="/campaign/new"
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
        >
          + 새 캠페인
        </Link>
      </div>

      {error && <ErrorNote message={error} />}

      {campaigns === null ? (
        <Spinner label="불러오는 중" />
      ) : campaigns.length === 0 ? (
        <EmptyNote message="아직 캠페인이 없습니다. 첫 캠페인을 만들어보세요." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {campaigns.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  selectedId === c.id
                    ? 'border-primary/60 bg-card'
                    : 'border-line bg-surface hover:bg-card'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{c.title}</p>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-2.5">
                  <ProgressBar raised={c.raisedAmount} goal={c.goalAmount} />
                </div>
                <p className="mt-1.5 text-xs text-mute">
                  {progressPercent(c.raisedAmount, c.goalAmount)}% · {remainingUntil(c.deadline)}
                </p>
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">{selected.title}</h2>
                    <p className="mt-1 text-sm text-mute">
                      {formatUsdc(selected.raisedAmount)} / {formatUsdc(selected.goalAmount)} ·{' '}
                      {remainingUntil(selected.deadline)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/campaign/${selected.id}`}
                      className="rounded-lg bg-raised px-3 py-1.5 text-sm font-medium text-mute transition-colors hover:text-ink"
                    >
                      공개 페이지
                    </Link>
                    {selected.status === '모금중' && (
                      <button
                        onClick={handleClose}
                        disabled={closing}
                        className="rounded-lg border border-warn/40 px-3 py-1.5 text-sm font-medium text-warn transition-colors hover:bg-warn/10 disabled:opacity-50"
                      >
                        {closing ? '마감 중…' : '조기 마감'}
                      </button>
                    )}
                  </div>
                </div>
                {settlement && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-raised px-3 py-2.5">
                      <p className="text-xs text-mute">집행</p>
                      <p className="mt-0.5 text-sm font-bold">{formatUsdc(settlement.releasedAmount)}</p>
                    </div>
                    <div className="rounded-xl bg-raised px-3 py-2.5">
                      <p className="text-xs text-mute">환불</p>
                      <p className="mt-0.5 text-sm font-bold">{formatUsdc(settlement.refundedAmount)}</p>
                    </div>
                    <div className="rounded-xl bg-raised px-3 py-2.5">
                      <p className="text-xs text-mute">에스크로 잔액</p>
                      <p className="mt-0.5 text-sm font-bold text-accent">
                        {formatUsdc(settlement.remainingInEscrow)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-raised px-3 py-2.5">
                      <p className="text-xs text-mute">AI 심사비</p>
                      <p className="mt-0.5 text-sm font-bold">
                        {formatUsdc(settlement.aiReviewCost)}
                        {settlement.aiReviewBudget !== null && (
                          <span className="ml-1 text-xs font-normal text-faint">
                            / {formatUsdc(settlement.aiReviewBudget)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-mute">에이전트 크루</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {agents === null ? (
                    <Spinner />
                  ) : (
                    agents.map((a) => (
                      <Card key={a.role} className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{metaFor(a.role).icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{metaFor(a.role).label}</p>
                            <p className="truncate text-xs text-faint">{metaFor(a.role).duty}</p>
                          </div>
                          <span
                            className={`flex items-center gap-1.5 text-xs font-semibold ${
                              a.state === 'running'
                                ? 'text-accent'
                                : a.state === 'waiting'
                                  ? 'text-warn'
                                  : 'text-faint'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                a.state === 'running'
                                  ? 'animate-pulse bg-accent'
                                  : a.state === 'waiting'
                                    ? 'bg-warn'
                                    : 'bg-faint'
                              }`}
                            />
                            {a.state}
                          </span>
                        </div>
                        {a.lastDecision && (
                          <p className="mt-2 truncate text-xs text-faint">
                            최근:{' '}
                            <span className={a.lastDecision.decision === 'approve' ? 'text-accent' : 'text-danger'}>
                              {a.lastDecision.decision}
                            </span>{' '}
                            {a.lastDecision.reason ?? ''}
                          </p>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-mute">증빙 심사</h3>
                  <button
                    onClick={handleAudit}
                    disabled={auditing}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-mute transition-colors hover:text-ink disabled:opacity-50"
                  >
                    {auditing ? '감사 중…' : '🔍 영수증 사후 감사 실행'}
                  </button>
                </div>
                {auditNote && (
                  <div className="mb-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
                    {auditNote}
                  </div>
                )}
                <Card className="divide-y divide-line">
                  {quotes === null ? (
                    <Spinner />
                  ) : quotes.length === 0 ? (
                    <EmptyNote message="제출된 증빙이 없습니다. 벤더 콘솔에서 견적서를 제출할 수 있습니다." />
                  ) : (
                    quotes.map((q) => (
                      <div key={q.proofId} className="px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              #{q.proofId} {q.vendorName ?? '벤더'}
                              <span className="ml-2 text-xs text-faint">
                                {q.type === 'quote' ? '견적서' : '영수증'}
                              </span>
                            </p>
                            <p className="mt-0.5 text-sm text-mute">{formatUsdc(q.amount)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {q.fileUrl && (
                              <a
                                href={q.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg bg-raised px-2.5 py-1 text-xs text-mute transition-colors hover:text-ink"
                              >
                                파일
                              </a>
                            )}
                            <ProofBadge status={q.status} />
                            {q.type === 'quote' && q.status === '검토중' && (
                              <button
                                onClick={() => handleEvaluate(q.proofId)}
                                disabled={evaluatingId !== null}
                                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
                              >
                                {evaluatingId === q.proofId ? 'Gemini 심사 중…' : 'AI 심사 실행'}
                              </button>
                            )}
                          </div>
                        </div>
                        {evalResult?.proofId === q.proofId && (
                          <div
                            className={`mt-3 rounded-xl border px-4 py-3 text-sm ${
                              evalResult.result.decision === 'approve'
                                ? 'border-accent/30 bg-accent/10'
                                : 'border-danger/30 bg-danger/10'
                            }`}
                          >
                            <p className="font-semibold">
                              {evalResult.result.decision === 'approve' ? '✓ 승인' : '✕ 거절'}
                              <span className="ml-2 text-xs font-normal text-mute">
                                {evalResult.result.model}
                                {evalResult.result.readFile ? ' · 증빙 파일 판독' : ''}
                              </span>
                            </p>
                            <ul className="mt-1.5 space-y-0.5 text-xs text-mute">
                              {evalResult.result.reasons.map((r, i) => (
                                <li key={i}>· {r}</li>
                              ))}
                            </ul>
                            {evalResult.result.micropay.paid && evalResult.result.micropay.txSignature && (
                              <p className="mt-1.5 font-mono text-xs text-faint">
                                심사비 micropay {formatUsdc(evalResult.result.micropay.amount ?? 0)} ·{' '}
                                <a
                                  href={explorerTxUrl(evalResult.result.micropay.txSignature)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline-offset-2 hover:underline"
                                >
                                  {shortAddress(evalResult.result.micropay.txSignature)} ↗
                                </a>
                              </p>
                            )}
                            {evalResult.result.execution?.executed && evalResult.result.execution.txSignature && (
                              <p className="mt-0.5 font-mono text-xs text-primary">
                                집행 {formatUsdc(evalResult.result.execution.releasedAmount ?? 0)} ·{' '}
                                <a
                                  href={explorerTxUrl(evalResult.result.execution.txSignature)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline-offset-2 hover:underline"
                                >
                                  {shortAddress(evalResult.result.execution.txSignature)} ↗
                                </a>
                              </p>
                            )}
                            {evalResult.result.execution && !evalResult.result.execution.executed && (
                              <p className="mt-0.5 text-xs text-warn">{evalResult.result.execution.reason}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </Card>
              </div>

              {selected.status === '모금중' && (
                <TierManager campaignId={selected.id} tiers={tiers} onCreated={() => loadDetail(selected.id)} />
              )}

              <div>
                <h3 className="mb-3 text-sm font-semibold text-mute">판단 · 집행 로그</h3>
                <Card className="divide-y divide-line">
                  {decisions === null ? (
                    <Spinner />
                  ) : decisions.length === 0 ? (
                    <EmptyNote message="아직 판단 기록이 없습니다." />
                  ) : (
                    decisions.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 px-5 py-4">
                        <span className="text-lg">{metaFor(d.agent).icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">
                            <span className="font-semibold">{metaFor(d.agent).label}</span>
                            <span className="ml-2 text-xs text-faint">{d.action}</span>
                          </p>
                          <p className="mt-0.5 text-sm text-mute">{d.reason}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs font-semibold ${
                              d.result === 'approve'
                                ? 'text-accent'
                                : d.result === 'reject'
                                  ? 'text-danger'
                                  : d.result === 'execute'
                                    ? 'text-primary'
                                    : 'text-mute'
                            }`}
                          >
                            {d.result}
                          </span>
                          <p className="mt-0.5 text-xs text-faint">{formatDateTime(d.at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TierManager({
  campaignId,
  tiers,
  onCreated,
}: {
  campaignId: number
  tiers: Tier[] | null
  onCreated: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [items, setItems] = useState('')
  const [limit, setLimit] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const priceUsdc = Number(price)
    const itemList = items
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (!title.trim() || !Number.isFinite(priceUsdc) || priceUsdc <= 0 || itemList.length === 0) {
      setError('티어명·가격·구성품을 확인해주세요. 구성품은 쉼표로 구분합니다.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const limitNum = Number(limit)
      await api.createTier(campaignId, {
        title: title.trim(),
        price: toRawUnits(priceUsdc),
        items: itemList,
        limit: Number.isInteger(limitNum) && limitNum > 0 ? limitNum : null,
      })
      setTitle('')
      setPrice('')
      setItems('')
      setLimit('')
      setShowForm(false)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : '티어 추가에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-mute">리워드 티어</h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-mute transition-colors hover:text-ink"
        >
          {showForm ? '닫기' : '+ 티어 추가'}
        </button>
      </div>
      {error && (
        <div className="mb-3">
          <ErrorNote message={error} />
        </div>
      )}
      {showForm && (
        <Card className="mb-3 p-5">
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="티어명 (예: 컵홀더 세트)"
              className="rounded-xl bg-raised px-3 py-2 text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
            />
            <input
              type="number"
              min="0"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="가격 (USDC)"
              className="rounded-xl bg-raised px-3 py-2 text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
            />
            <input
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="구성품 (쉼표 구분: 포토카드, 컵홀더)"
              className="rounded-xl bg-raised px-3 py-2 text-sm outline-none ring-primary/60 transition-shadow focus:ring-2 sm:col-span-2"
            />
            <input
              type="number"
              min="1"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="수량 제한 (선택)"
              className="rounded-xl bg-raised px-3 py-2 text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
            >
              {submitting ? '추가 중…' : '추가'}
            </button>
          </form>
        </Card>
      )}
      {tiers !== null && tiers.length > 0 && (
        <Card className="divide-y divide-line">
          {tiers.map((t) => (
            <div key={t.tierId} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.title}</p>
                <p className="mt-0.5 truncate text-xs text-faint">{t.items.join(' · ')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-accent">{formatUsdc(t.price)}</p>
                <p className="mt-0.5 text-xs text-faint">
                  {t.limit === null ? `${t.soldCount}개 판매` : `${t.soldCount}/${t.limit} 판매`}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
