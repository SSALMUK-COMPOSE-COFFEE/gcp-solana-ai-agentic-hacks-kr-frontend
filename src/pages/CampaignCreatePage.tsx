import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import type { CampaignPolicy, CategoryPolicy } from '../api'
import { toRawUnits } from '../lib/format'
import { Card, ErrorNote } from '../components/ui'
import { useAuth } from '../store/auth'

const categories = ['생일카페', '지하철광고', '전광판', '서포트', '기타']

export default function CampaignCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [goal, setGoal] = useState('')
  const [deadline, setDeadline] = useState('')
  const [maxUnitPrice, setMaxUnitPrice] = useState('')
  const [maxTotal, setMaxTotal] = useState('')
  const [unitLabel, setUnitLabel] = useState('')
  const [aiReviewBudget, setAiReviewBudget] = useState('')
  const [allowSurplusScaling, setAllowSurplusScaling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login', { state: { from: '/campaign/new' } })
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const goalUsdc = Number(goal)
    if (!title.trim() || !Number.isFinite(goalUsdc) || goalUsdc <= 0 || !deadline) {
      setError('제목·목표 금액·마감일을 확인해주세요.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const categoryPolicy: CategoryPolicy = {}
      const unit = Number(maxUnitPrice)
      const total = Number(maxTotal)
      if (Number.isFinite(unit) && unit > 0) categoryPolicy.maxUnitPrice = toRawUnits(unit)
      if (Number.isFinite(total) && total > 0) categoryPolicy.maxTotal = toRawUnits(total)
      if (unitLabel.trim()) categoryPolicy.unitLabel = unitLabel.trim()
      const policy: CampaignPolicy = {}
      if (Object.keys(categoryPolicy).length > 0) policy.categories = { [category]: categoryPolicy }
      const budget = Number(aiReviewBudget)
      if (Number.isFinite(budget) && budget > 0) policy.aiReviewBudget = toRawUnits(budget)
      if (allowSurplusScaling) policy.allowSurplusScaling = true
      const result = await api.createCampaign({
        title: title.trim(),
        category,
        goalAmount: toRawUnits(goalUsdc),
        deadline: new Date(deadline).toISOString(),
        policy,
      })
      navigate(`/campaign/${result.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '캠페인 생성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link to="/dashboard" className="text-sm text-mute hover:text-ink">
          ← 대시보드
        </Link>
        <h1 className="mt-2 text-2xl font-bold">새 캠페인</h1>
        <p className="mt-1 text-sm text-mute">
          생성과 동시에 온체인 escrow가 만들어지고, 에이전트 크루가 정책을 넘겨받습니다
        </p>
      </div>

      {error && <ErrorNote message={error} />}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-mute">캠페인 제목</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="아이돌 OO 생일카페"
              className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-mute">카테고리</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    category === c ? 'bg-primary text-white' : 'bg-raised text-mute hover:text-ink'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-mute">목표 금액 (USDC)</span>
            <input
              type="number"
              min="1"
              step="any"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="30000"
              className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-mute">마감일</span>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2 [color-scheme:dark]"
            />
          </label>

          <fieldset className="rounded-xl border border-line p-4">
            <legend className="px-1 text-sm font-medium text-mute">집행 정책 (선택)</legend>
            <p className="text-xs text-faint">
              에이전트가 이 한도를 넘는 지출을 자동 거절합니다 — {category} 카테고리에 적용
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-mute">단가 한도 (USDC)</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={maxUnitPrice}
                  onChange={(e) => setMaxUnitPrice(e.target.value)}
                  placeholder="12000"
                  className="mt-1 w-full rounded-xl bg-raised px-3 py-2 text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-mute">총액 한도 (USDC)</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={maxTotal}
                  onChange={(e) => setMaxTotal(e.target.value)}
                  placeholder="28000"
                  className="mt-1 w-full rounded-xl bg-raised px-3 py-2 text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-mute">단가 단위 표기</span>
                <input
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  maxLength={30}
                  placeholder="2주 1면"
                  className="mt-1 w-full rounded-xl bg-raised px-3 py-2 text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-mute">AI 심사 예산 (USDC)</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={aiReviewBudget}
                  onChange={(e) => setAiReviewBudget(e.target.value)}
                  placeholder="20"
                  className="mt-1 w-full rounded-xl bg-raised px-3 py-2 text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
                />
              </label>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-mute">
              <input
                type="checkbox"
                checked={allowSurplusScaling}
                onChange={(e) => setAllowSurplusScaling(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              초과 모금 시 한도를 모금 비율만큼 확대 허용
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
          >
            {submitting ? 'escrow 생성 중…' : '캠페인 만들기'}
          </button>
        </form>
      </Card>
    </div>
  )
}
