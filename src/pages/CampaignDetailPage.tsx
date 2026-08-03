import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import type {
  AgentDecision,
  BreakdownRow,
  CampaignDetail,
  CampaignProgress,
  ContributionList,
  QuoteItem,
  Settlement,
  Tier,
} from '../api'
import {
  explorerTxUrl,
  formatDateTime,
  formatRemaining,
  formatUsdc,
  progressPercent,
  shortAddress,
} from '../lib/format'
import {
  Card,
  EmptyNote,
  ErrorNote,
  ProgressBar,
  ProofBadge,
  Spinner,
  StatusBadge,
  metaFor,
} from '../components/ui'

export default function CampaignDetailPage() {
  const { id } = useParams()
  const campaignId = Number(id)
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [progress, setProgress] = useState<CampaignProgress | null>(null)
  const [contributions, setContributions] = useState<ContributionList | null>(null)
  const [quotes, setQuotes] = useState<QuoteItem[] | null>(null)
  const [decisions, setDecisions] = useState<AgentDecision[] | null>(null)
  const [tiers, setTiers] = useState<Tier[] | null>(null)
  const [settlement, setSettlement] = useState<Settlement | null>(null)
  const [breakdown, setBreakdown] = useState<BreakdownRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    function load<T>(promise: Promise<T>, set: (value: T) => void) {
      promise
        .then((value) => {
          if (alive) set(value)
        })
        .catch((e: Error) => {
          if (alive) setError(e.message)
        })
    }
    load(api.getCampaign(campaignId), setCampaign)
    load(api.getCampaignStatus(campaignId), setProgress)
    load(api.getContributions(campaignId), setContributions)
    load(api.getQuotes(campaignId), setQuotes)
    load(api.getDecisions(campaignId), setDecisions)
    load(api.getTiers(campaignId), setTiers)
    load(api.getSettlement(campaignId), setSettlement)
    load(api.getBreakdown(campaignId), setBreakdown)
    return () => {
      alive = false
    }
  }, [campaignId])

  async function copyPda() {
    if (!campaign) return
    await navigator.clipboard.writeText(campaign.escrowPda)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!campaign) {
    return error ? <ErrorNote message={error} /> : <Spinner label="캠페인 불러오는 중" />
  }

  const pct = progressPercent(campaign.raisedAmount, campaign.goalAmount)
  const funding = campaign.status === '모금중'
  const showBreakdown = campaign.status === '환불중' || campaign.status === '종료'

  return (
    <div className="space-y-6">
      {error && <ErrorNote message={error} />}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-faint">{campaign.category}</p>
          <h1 className="mt-1 text-2xl font-bold">{campaign.title}</h1>
          <button
            onClick={copyPda}
            className="mt-2 rounded-lg bg-raised px-2.5 py-1 font-mono text-xs text-mute transition-colors hover:text-ink"
          >
            escrow {shortAddress(campaign.escrowPda, 6)} {copied ? '✓ 복사됨' : '⧉'}
          </button>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-mute">모금액</p>
            <p className="mt-1 text-3xl font-bold">
              {formatUsdc(campaign.raisedAmount)}
              <span className="ml-2 text-base font-semibold text-accent">{pct}%</span>
            </p>
            <p className="mt-1 text-sm text-mute">목표 {formatUsdc(campaign.goalAmount)}</p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-sm text-mute">기여자</p>
              <p className="mt-1 text-xl font-bold">
                {progress ? progress.contributorCount.toLocaleString('ko-KR') : '—'}명
              </p>
            </div>
            <div>
              <p className="text-sm text-mute">마감까지</p>
              <p className="mt-1 text-xl font-bold">
                {progress ? formatRemaining(progress.remainingSeconds) : '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <ProgressBar raised={campaign.raisedAmount} goal={campaign.goalAmount} tall />
        </div>
        {funding && (
          <Link
            to={`/campaign/${campaign.id}/contribute`}
            className="mt-6 block rounded-xl bg-primary py-3 text-center font-semibold text-white transition-colors hover:bg-primary-deep"
          >
            Solana Pay로 기여하기
          </Link>
        )}
      </Card>

      {tiers !== null && tiers.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold">리워드 티어</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {tiers.map((t) => {
              const soldOut = t.remaining !== null && t.remaining <= 0
              return (
                <div key={t.tierId} className="flex flex-col rounded-xl bg-raised p-4">
                  <p className="text-sm font-semibold">{t.title}</p>
                  <p className="mt-1 text-lg font-bold text-accent">{formatUsdc(t.price)}</p>
                  <ul className="mt-2 flex-1 space-y-1 text-xs text-mute">
                    {t.items.map((item, i) => (
                      <li key={i}>· {item}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-faint">
                    {t.limit === null ? `${t.soldCount}개 판매` : soldOut ? '품절' : `${t.remaining}개 남음`}
                  </p>
                  {funding && (
                    <Link
                      to={`/campaign/${campaign.id}/contribute?tier=${t.tierId}`}
                      aria-disabled={soldOut}
                      className={`mt-3 rounded-lg py-2 text-center text-sm font-semibold transition-colors ${
                        soldOut
                          ? 'pointer-events-none bg-line text-faint'
                          : 'bg-primary text-white hover:bg-primary-deep'
                      }`}
                    >
                      이 티어로 기여
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold">에이전트 판단 로그</h2>
          <p className="mt-0.5 text-xs text-faint">모든 판단은 공개됩니다 — 누구나 감사할 수 있습니다</p>
          <div className="mt-4 space-y-4">
            {decisions === null ? (
              <Spinner />
            ) : decisions.length === 0 ? (
              <EmptyNote message="아직 판단 기록이 없습니다." />
            ) : (
              decisions.map((d, i) => (
                <div key={i} className="flex gap-3">
                  <span className="mt-0.5 text-lg">{metaFor(d.agent).icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{metaFor(d.agent).label}</span>
                      <span
                        className={`ml-2 text-xs font-semibold ${
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
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-mute">{d.reason}</p>
                    <p className="mt-0.5 text-xs text-faint">{formatDateTime(d.at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold">정산 현황</h2>
            <p className="mt-0.5 text-xs text-faint">에스크로 잔액과 집행 내역은 온체인으로 검증됩니다</p>
            {settlement === null ? (
              <Spinner />
            ) : (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-raised px-4 py-3">
                    <p className="text-xs text-mute">집행</p>
                    <p className="mt-1 text-sm font-bold">{formatUsdc(settlement.releasedAmount)}</p>
                  </div>
                  <div className="rounded-xl bg-raised px-4 py-3">
                    <p className="text-xs text-mute">환불</p>
                    <p className="mt-1 text-sm font-bold">{formatUsdc(settlement.refundedAmount)}</p>
                  </div>
                  <div className="rounded-xl bg-raised px-4 py-3">
                    <p className="text-xs text-mute">에스크로 잔액</p>
                    <p className="mt-1 text-sm font-bold text-accent">
                      {formatUsdc(settlement.remainingInEscrow)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-raised px-4 py-3">
                    <p className="text-xs text-mute">AI 심사비</p>
                    <p className="mt-1 text-sm font-bold">
                      {formatUsdc(settlement.aiReviewCost)}
                      {settlement.aiReviewBudget !== null && (
                        <span className="ml-1 text-xs font-normal text-faint">
                          / {formatUsdc(settlement.aiReviewBudget)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {settlement.aiReceipts.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-medium text-faint">AI 심사 영수증 (x402 micropay)</p>
                    {settlement.aiReceipts.slice(0, 4).map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-mute">
                        <span className="font-mono">{r.resource}</span>
                        <span className="flex items-center gap-2">
                          <a
                            href={explorerTxUrl(r.txSignature)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-faint underline-offset-2 hover:underline"
                          >
                            {shortAddress(r.txSignature)} ↗
                          </a>
                          <span>{formatUsdc(r.amount)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">견적 · 증빙</h2>
            <div className="mt-4 space-y-3">
              {quotes === null ? (
                <Spinner />
              ) : quotes.length === 0 ? (
                <EmptyNote message="제출된 견적이 없습니다." />
              ) : (
                quotes.map((q) => (
                  <div key={q.proofId} className="flex items-center justify-between gap-3 rounded-xl bg-raised px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        {q.vendorName ?? '벤더'}
                        <span className="ml-2 text-xs text-faint">{q.type === 'quote' ? '견적서' : '영수증'}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-mute">{formatUsdc(q.amount)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {q.fileUrl && (
                        <a
                          href={q.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-line/60 px-2.5 py-1 text-xs text-mute transition-colors hover:text-ink"
                        >
                          파일
                        </a>
                      )}
                      <ProofBadge status={q.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">최근 기여</h2>
            <div className="mt-4 space-y-3">
              {contributions === null ? (
                <Spinner />
              ) : contributions.contributions.length === 0 ? (
                <EmptyNote message="첫 기여자가 되어보세요." />
              ) : (
                contributions.contributions.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="flex items-center gap-3">
                      {c.txSignature ? (
                        <a
                          href={explorerTxUrl(c.txSignature)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-faint underline-offset-2 hover:underline"
                        >
                          {shortAddress(c.txSignature)} ↗
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-faint">—</span>
                      )}
                      <span className="font-semibold text-accent">+{formatUsdc(c.amount)}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {showBreakdown && (
        <Card className="p-6">
          <h2 className="font-semibold">기여자별 정산 내역</h2>
          <p className="mt-0.5 text-xs text-faint">
            기여 비율 기반 환불 — 온체인 기여 기록으로 계산됩니다
          </p>
          {breakdown === null ? (
            <Spinner />
          ) : breakdown.length === 0 ? (
            <EmptyNote message="정산 내역이 없습니다." />
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-faint">
                    <th className="pb-2 font-medium">지갑</th>
                    <th className="pb-2 text-right font-medium">기여</th>
                    <th className="pb-2 text-right font-medium">환불</th>
                    <th className="pb-2 text-right font-medium">비율</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {breakdown.map((row, i) => (
                    <tr key={i}>
                      <td className="py-2 font-mono text-xs text-mute">{row.walletAddress}</td>
                      <td className="py-2 text-right">{formatUsdc(row.contributed)}</td>
                      <td className="py-2 text-right text-accent">
                        {row.refunded > 0 ? formatUsdc(row.refunded) : '—'}
                      </td>
                      <td className="py-2 text-right text-mute">{(row.ratio * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
