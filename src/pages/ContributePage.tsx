import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../api'
import type { CampaignDetail, PayQr, Tier } from '../api'
import { explorerTxUrl, formatUsdc, toRawUnits } from '../lib/format'
import { Card, ErrorNote, Spinner } from '../components/ui'
import { useAuth } from '../store/auth'

const presets = [10, 30, 50, 100]

type Step = 'amount' | 'qr' | 'done'

export default function ContributePage() {
  const { id } = useParams()
  const campaignId = Number(id)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tierId = searchParams.get('tier') ? Number(searchParams.get('tier')) : undefined
  const { user } = useAuth()
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [tier, setTier] = useState<Tier | null>(null)
  const [tierLoading, setTierLoading] = useState(tierId !== undefined)
  const [amount, setAmount] = useState('30')
  const [step, setStep] = useState<Step>('amount')
  const [pay, setPay] = useState<PayQr | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/campaign/${campaignId}/contribute` } })
      return
    }
    let alive = true
    api
      .getCampaign(campaignId)
      .then((c) => {
        if (alive) setCampaign(c)
      })
      .catch((e: Error) => {
        if (alive) setError(e.message)
      })
    if (tierId !== undefined) {
      setTierLoading(true)
      api
        .getTiers(campaignId)
        .then((tiers) => {
          if (alive) setTier(tiers.find((t) => t.tierId === tierId) ?? null)
        })
        .catch(() => void 0)
        .finally(() => {
          if (alive) setTierLoading(false)
        })
    }
    return () => {
      alive = false
    }
  }, [campaignId, tierId, user, navigate])

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const payAmountRaw = tier ? tier.price : toRawUnits(Number(amount))

  async function startPayment() {
    if (tierLoading) return
    if (!tier) {
      const usdc = Number(amount)
      if (!Number.isFinite(usdc) || usdc <= 0) {
        setError('올바른 금액을 입력해주세요.')
        return
      }
    }
    setError(null)
    setCreating(true)
    try {
      const result = tier
        ? await api.createPayQr(campaignId, null, tier.tierId)
        : await api.createPayQr(campaignId, toRawUnits(Number(amount)))
      setPay(result)
      setStep('qr')
      pollRef.current = setInterval(async () => {
        try {
          const status = await api.getPayStatus(result.reference)
          if (status.status === 'confirmed' && status.txSignature) {
            if (pollRef.current) clearInterval(pollRef.current)
            setTxSignature(status.txSignature)
            try {
              await api.recordContribution(result.reference, status.txSignature)
            } catch {
              void 0
            }
            setStep('done')
          }
        } catch {
          void 0
        }
      }, 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : '결제 요청에 실패했습니다.')
    } finally {
      setCreating(false)
    }
  }

  if (!campaign) {
    return error ? <ErrorNote message={error} /> : <Spinner label="캠페인 불러오는 중" />
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link to={`/campaign/${campaignId}`} className="text-sm text-mute hover:text-ink">
          ← {campaign.title}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">기여하기</h1>
        <p className="mt-1 text-sm text-mute">
          USDC만 있으면 됩니다 — 네트워크 수수료는 서버가 대신 냅니다 (gasless)
        </p>
      </div>

      {error && <ErrorNote message={error} />}

      {step === 'amount' && (
        <Card className="space-y-5 p-6">
          {tierLoading ? (
            <Spinner label="티어 불러오는 중" />
          ) : tier ? (
            <div className="rounded-xl bg-raised p-4">
              <p className="text-sm font-semibold">{tier.title}</p>
              <p className="mt-1 text-2xl font-bold text-accent">{formatUsdc(tier.price)}</p>
              <ul className="mt-2 space-y-1 text-xs text-mute">
                {tier.items.map((item, i) => (
                  <li key={i}>· {item}</li>
                ))}
              </ul>
              {tier.remaining !== null && (
                <p className="mt-2 text-xs text-faint">{tier.remaining}개 남음</p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(String(p))}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                      amount === String(p) ? 'bg-primary text-white' : 'bg-raised text-mute hover:text-ink'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-raised px-4 py-3">
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-2xl font-bold outline-none"
                />
                <span className="font-semibold text-mute">USDC</span>
              </div>
            </>
          )}
          <button
            onClick={startPayment}
            disabled={creating || tierLoading}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
          >
            {creating ? 'QR 생성 중…' : 'Solana Pay QR 생성'}
          </button>
        </Card>
      )}

      {step === 'qr' && pay && (
        <Card className="space-y-5 p-6 text-center">
          <div className="mx-auto w-fit rounded-2xl bg-white p-4">
            <QRCodeSVG value={pay.url} size={220} level="M" />
          </div>
          <div>
            <p className="text-lg font-bold">{formatUsdc(pay.amount || payAmountRaw)}</p>
            {tier && <p className="mt-0.5 text-xs text-mute">{tier.title}</p>}
            <p className="mt-1 text-sm text-mute">지갑 앱으로 QR을 스캔해주세요</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-mute">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-accent" />
            온체인 확정 대기 중
          </div>
          <a
            href={pay.url}
            className="block text-sm font-medium text-primary hover:underline"
          >
            모바일이라면 지갑 앱으로 바로 열기
          </a>
        </Card>
      )}

      {step === 'done' && (
        <Card className="space-y-4 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-2xl">
            ✓
          </div>
          <div>
            <p className="text-xl font-bold">기여 완료!</p>
            <p className="mt-1 text-sm text-mute">
              {formatUsdc(payAmountRaw)}가 에스크로에 안전하게 보관됐습니다
            </p>
          </div>
          {txSignature && (
            <a
              href={explorerTxUrl(txSignature)}
              target="_blank"
              rel="noreferrer"
              className="block break-all rounded-xl bg-raised px-4 py-3 font-mono text-xs text-faint transition-colors hover:text-primary"
            >
              {txSignature} ↗
            </a>
          )}
          <Link
            to={`/campaign/${campaignId}`}
            className="block rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep"
          >
            캠페인으로 돌아가기
          </Link>
        </Card>
      )}
    </div>
  )
}
