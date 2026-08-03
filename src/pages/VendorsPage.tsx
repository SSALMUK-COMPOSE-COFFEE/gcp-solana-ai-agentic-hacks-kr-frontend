import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { RegisterVendorResult, Vendor } from '../api'
import { shortAddress } from '../lib/format'
import { Card, EmptyNote, ErrorNote, Spinner } from '../components/ui'

const categories = ['생일카페', '지하철광고', '전광판', '서포트', '기타']

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[] | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [walletAddress, setWalletAddress] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState<RegisterVendorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function loadVendors() {
    const list = await api.listVendors()
    setVendors(list)
  }

  useEffect(() => {
    loadVendors().catch((e: Error) => {
      setVendors([])
      setError(e.message)
    })
  }, [])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || walletAddress.trim().length < 32) {
      setError('업체명과 올바른 지갑 주소를 입력해주세요.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const result = await api.registerVendor({
        name: name.trim(),
        category,
        walletAddress: walletAddress.trim(),
        contact: contact.trim() || undefined,
      })
      setRegistered(result)
      setShowForm(false)
      await loadVendors()
    } catch (err) {
      setError(err instanceof Error ? err.message : '벤더 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  async function copyKey() {
    if (!registered) return
    await navigator.clipboard.writeText(registered.apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">벤더</h1>
          <p className="mt-1 text-sm text-mute">
            allowlist에 등재된 벤더에게만 에이전트가 집행합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/vendor/console"
            className="rounded-xl bg-raised px-4 py-2.5 text-sm font-medium text-mute transition-colors hover:text-ink"
          >
            벤더 콘솔
          </Link>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
          >
            + 벤더 등록
          </button>
        </div>
      </div>

      {error && <ErrorNote message={error} />}

      {registered && (
        <Card className="border-accent/40 p-6">
          <h2 className="font-semibold text-accent">등록 완료 — API 키를 지금 보관하세요</h2>
          <p className="mt-1 text-sm text-mute">
            이 키는 지금 한 번만 표시됩니다. 견적·증빙 제출 시 벤더 콘솔에서 사용합니다.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 break-all rounded-xl bg-raised px-4 py-3 font-mono text-sm">
              {registered.apiKey}
            </code>
            <button
              onClick={copyKey}
              className="rounded-lg bg-raised px-3 py-2 text-sm text-mute transition-colors hover:text-ink"
            >
              {copied ? '✓ 복사됨' : '복사'}
            </button>
          </div>
          {!registered.allowlisted && (
            <p className="mt-3 text-xs text-warn">
              아직 allowlist 미등재 상태입니다 — 운영자 승인 후 견적 제출이 가능합니다.
            </p>
          )}
        </Card>
      )}

      {showForm && (
        <Card className="p-6">
          <h2 className="font-semibold">벤더 등록</h2>
          <form onSubmit={handleRegister} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-mute">업체명</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="OO광고기획"
                  className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-mute">카테고리</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-mute">USDC 수령 지갑 주소</span>
              <input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Solana 지갑 주소 (base58)"
                className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 font-mono text-sm outline-none ring-primary/60 transition-shadow focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-mute">연락처 (선택)</span>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="이메일 또는 전화번호"
                className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
            >
              {submitting ? '등록 중…' : '등록하기'}
            </button>
          </form>
        </Card>
      )}

      {vendors === null ? (
        <Spinner label="불러오는 중" />
      ) : vendors.length === 0 ? (
        <EmptyNote message="등록된 벤더가 없습니다." />
      ) : (
        <Card className="divide-y divide-line">
          {vendors.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {v.name}
                  <span className="ml-2 text-xs font-normal text-faint">{v.category}</span>
                </p>
                <p className="mt-0.5 font-mono text-xs text-faint">{shortAddress(v.walletAddress, 6)}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  v.allowlisted ? 'bg-accent/15 text-accent' : 'bg-faint/20 text-mute'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${v.allowlisted ? 'bg-accent' : 'bg-faint'}`} />
                {v.allowlisted ? 'allowlist' : '대기'}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
