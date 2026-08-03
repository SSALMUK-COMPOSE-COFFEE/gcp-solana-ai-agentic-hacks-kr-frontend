import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { CampaignStatus, CampaignSummary } from '../api'
import { formatUsdc, progressPercent, remainingUntil } from '../lib/format'
import { Card, EmptyNote, ProgressBar, Spinner, StatusBadge } from '../components/ui'

const filters: Array<CampaignStatus | '전체'> = ['전체', '모금중', '집행중', '환불중', '종료']

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[] | null>(null)
  const [filter, setFilter] = useState<CampaignStatus | '전체'>('전체')

  useEffect(() => {
    let alive = true
    setCampaigns(null)
    api
      .listCampaigns(filter === '전체' ? undefined : { status: filter })
      .then((list) => {
        if (alive) setCampaigns(list)
      })
      .catch(() => {
        if (alive) setCampaigns([])
      })
    return () => {
      alive = false
    }
  }, [filter])

  return (
    <div className="space-y-8">
      <section className="space-y-3 pt-4">
        <p className="text-sm font-semibold text-accent">신뢰하는 사람 → 검증하는 프로토콜</p>
        <h1 className="max-w-2xl text-3xl font-bold leading-snug">
          총대의 집행 버튼을 없앤
          <br />
          팬덤 에스크로 에이전트
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-mute">
          모금부터 집행·환불까지 Solana 에스크로에서 처리하고, AI 에이전트가 정책대로 자율 집행합니다.
          총대는 자금에 손댈 수 없습니다 — 온체인이 증명합니다.
        </p>
      </section>

      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary text-white' : 'bg-raised text-mute hover:text-ink'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {campaigns === null ? (
        <Spinner label="캠페인 불러오는 중" />
      ) : campaigns.length === 0 ? (
        <EmptyNote message="해당 상태의 캠페인이 없습니다." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((c) => (
            <Link key={c.id} to={`/campaign/${c.id}`}>
              <Card className="h-full p-5 transition-colors hover:border-primary/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-faint">{c.category}</p>
                    <h2 className="mt-1 font-semibold leading-snug">{c.title}</h2>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-5 space-y-2">
                  <ProgressBar raised={c.raisedAmount} goal={c.goalAmount} />
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-ink">
                      {formatUsdc(c.raisedAmount)}
                      <span className="ml-1.5 text-xs font-medium text-accent">
                        {progressPercent(c.raisedAmount, c.goalAmount)}%
                      </span>
                    </span>
                    <span className="text-xs text-mute">
                      목표 {formatUsdc(c.goalAmount)} · {remainingUntil(c.deadline)}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
