import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { CampaignSummary, Vendor } from '../api'
import { formatUsdc, toRawUnits } from '../lib/format'
import { Card, ErrorNote, Spinner } from '../components/ui'

const KEY_STORAGE = 'chongdae.vendor.key'
const ID_STORAGE = 'chongdae.vendor.id'

const ACCEPTED = '.pdf,.png,.jpg,.jpeg,.webp'
const MAX_BYTES = 12 * 1024 * 1024

interface ItemRow {
  name: string
  unitPrice: string
  quantity: string
}

const emptyRow: ItemRow = { name: '', unitPrice: '', quantity: '1' }

export default function VendorConsolePage() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY_STORAGE) ?? '')
  const [vendorId, setVendorId] = useState(() => localStorage.getItem(ID_STORAGE) ?? '')
  const [vendors, setVendors] = useState<Vendor[] | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignSummary[] | null>(null)
  const [proofType, setProofType] = useState<'quote' | 'receipt'>('quote')
  const [campaignId, setCampaignId] = useState('')
  const [rows, setRows] = useState<ItemRow[]>([{ ...emptyRow }])
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ proofId: number; type: 'quote' | 'receipt' } | null>(null)

  useEffect(() => {
    let alive = true
    api
      .listVendors()
      .then((list) => {
        if (alive) setVendors(list)
      })
      .catch((e: Error) => {
        if (alive) {
          setVendors([])
          setError(e.message)
        }
      })
    api
      .listCampaigns()
      .then((list) => {
        if (alive) {
          setCampaigns(list)
          setCampaignId((prev) => prev || String(list[0]?.id ?? ''))
        }
      })
      .catch((e: Error) => {
        if (alive) {
          setCampaigns([])
          setError(e.message)
        }
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(KEY_STORAGE, apiKey)
  }, [apiKey])

  useEffect(() => {
    localStorage.setItem(ID_STORAGE, vendorId)
  }, [vendorId])

  const totalRaw = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const price = Number(row.unitPrice)
        const qty = Number(row.quantity)
        if (!Number.isFinite(price) || !Number.isFinite(qty)) return sum
        return sum + toRawUnits(price) * qty
      }, 0),
    [rows],
  )

  function updateRow(index: number, patch: Partial<ItemRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function handleFile(selected: File | null) {
    if (selected && selected.size > MAX_BYTES) {
      setError('파일이 너무 큽니다. 12MB 이하로 올려주세요.')
      setFile(null)
      return
    }
    setError(null)
    setFile(selected)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    if (!apiKey.trim() || !vendorId) {
      setError('벤더 API 키와 벤더를 선택해주세요.')
      return
    }
    if (!campaignId) {
      setError('캠페인을 선택해주세요.')
      return
    }
    const items = rows
      .filter((r) => r.name.trim())
      .map((r) => ({
        name: r.name.trim(),
        unitPrice: toRawUnits(Number(r.unitPrice)),
        quantity: Number(r.quantity),
      }))
    if (items.length === 0 || items.some((i) => !Number.isFinite(i.unitPrice) || i.unitPrice <= 0 || !Number.isInteger(i.quantity) || i.quantity <= 0)) {
      setError('항목명·단가·수량을 확인해주세요.')
      return
    }
    if (!file) {
      setError(proofType === 'quote' ? '견적서 파일을 첨부해주세요.' : '영수증 파일을 첨부해주세요.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const fileUrl = await api.uploadProofFile(apiKey.trim(), file)
      const input = {
        campaignId: Number(campaignId),
        items,
        totalAmount: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
        fileUrl,
      }
      const proofId =
        proofType === 'quote'
          ? await api.submitQuote(apiKey.trim(), Number(vendorId), input)
          : await api.submitReceipt(apiKey.trim(), input)
      setResult({ proofId, type: proofType })
      setRows([{ ...emptyRow }])
      setFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (vendors === null || campaigns === null) return <Spinner label="불러오는 중" />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/vendors" className="text-sm text-mute hover:text-ink">
          ← 벤더 목록
        </Link>
        <h1 className="mt-2 text-2xl font-bold">벤더 콘솔</h1>
        <p className="mt-1 text-sm text-mute">
          견적서·영수증을 제출하면 AI 에이전트가 캠페인 정책과 대조해 심사합니다
        </p>
      </div>

      {error && <ErrorNote message={error} />}

      {result && (
        <Card className="border-accent/40 p-5">
          <p className="text-sm font-semibold text-accent">
            {result.type === 'quote' ? '견적서' : '영수증'} 제출 완료 — 증빙 #{result.proofId} (검토중)
          </p>
          <p className="mt-1 text-xs text-mute">
            심사 결과는 캠페인 상세의 판단 로그에서 확인할 수 있습니다.
          </p>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="font-semibold">인증</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-mute">벤더 API 키</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="등록 시 발급된 키"
              className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 font-mono text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-mute">벤더</span>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
            >
              <option value="">선택</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                  {v.allowlisted ? '' : ' (allowlist 대기)'}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-2">
            {(['quote', 'receipt'] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setProofType(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  proofType === t ? 'bg-primary text-white' : 'bg-raised text-mute hover:text-ink'
                }`}
              >
                {t === 'quote' ? '견적서' : '영수증'}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-sm font-medium text-mute">캠페인</span>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} {c.title} ({c.status})
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="text-sm font-medium text-mute">항목</span>
            <div className="mt-1.5 space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={row.name}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    placeholder="항목명"
                    className="min-w-0 flex-1 rounded-xl bg-raised px-3 py-2 text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
                  />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={row.unitPrice}
                    onChange={(e) => updateRow(i, { unitPrice: e.target.value })}
                    placeholder="단가(USDC)"
                    className="w-28 rounded-xl bg-raised px-3 py-2 text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
                  />
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) => updateRow(i, { quantity: e.target.value })}
                    placeholder="수량"
                    className="w-16 rounded-xl bg-raised px-3 py-2 text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev))}
                    className="rounded-xl bg-raised px-3 text-sm text-faint transition-colors hover:text-danger"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRows((prev) => [...prev, { ...emptyRow }])}
                className="text-sm font-medium text-primary hover:underline"
              >
                + 항목 추가
              </button>
              <span className="text-sm text-mute">
                총액 <span className="font-semibold text-ink">{formatUsdc(totalRaw)}</span>
              </span>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-mute">
              {proofType === 'quote' ? '견적서 파일' : '영수증 파일'} (PDF·PNG·JPG·WebP, 12MB 이하)
            </span>
            <input
              type="file"
              accept={ACCEPTED}
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 text-sm text-mute file:mr-3 file:rounded-lg file:border-0 file:bg-line file:px-3 file:py-1.5 file:text-sm file:text-ink"
            />
            <span className="mt-1 block text-xs text-faint">
              Gemini가 파일을 직접 읽고 신고 금액과 대조합니다 — 구조화 데이터만으로는 심사되지 않습니다
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
          >
            {submitting ? '업로드 · 제출 중…' : proofType === 'quote' ? '견적서 제출' : '영수증 제출'}
          </button>
        </form>
      </Card>
    </div>
  )
}
