import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import type { Certificate, MyContribution } from '../api'
import { formatDate, formatDateTime, formatUsdc, shortAddress } from '../lib/format'
import { connectWallet, hasWallet, signNonce } from '../lib/wallet'
import { Card, EmptyNote, ErrorNote, Spinner, StatusBadge } from '../components/ui'
import { useAuth } from '../store/auth'

export default function MyPage() {
  const { user, refreshUser, clearSession } = useAuth()
  const navigate = useNavigate()
  const [contributions, setContributions] = useState<MyContribution[] | null>(null)
  const [certificates, setCertificates] = useState<Certificate[] | null>(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/me' } })
      return
    }
    setName(user.name)
    setBio(user.bio ?? '')
    let alive = true
    api
      .getMyContributions()
      .then((list) => {
        if (alive) setContributions(list)
      })
      .catch((e: Error) => {
        if (alive) {
          setContributions([])
          setError(e.message)
        }
      })
    api
      .getMyCertificates()
      .then((list) => {
        if (alive) setCertificates(list)
      })
      .catch((e: Error) => {
        if (alive) {
          setCertificates([])
          setError(e.message)
        }
      })
    return () => {
      alive = false
    }
  }, [user, navigate])

  if (!user) return null

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await api.updateMe({ name: name.trim(), bio: bio.trim() })
      await refreshUser()
      setEditing(false)
      setNotice('프로필이 저장되었습니다.')
    } catch (e) {
      setError(e instanceof Error ? e.message : '프로필 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleConnectWallet() {
    setConnecting(true)
    setError(null)
    setNotice(null)
    try {
      const walletAddress = await connectWallet()
      const nonce = await api.walletNonce(walletAddress)
      const signature = await signNonce(nonce)
      await api.walletConnect(walletAddress, signature, nonce)
      await refreshUser()
      setNotice('지갑이 연결되었습니다. 이제 캠페인을 만들 수 있습니다.')
    } catch (e) {
      setError(e instanceof Error ? e.message : '지갑 연결에 실패했습니다.')
    } finally {
      setConnecting(false)
    }
  }

  async function handleWithdraw() {
    if (!window.confirm('정말 탈퇴할까요? 기여 내역은 익명화되고 되돌릴 수 없습니다.')) return
    setWithdrawing(true)
    setError(null)
    try {
      await api.withdraw()
      clearSession()
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : '탈퇴에 실패했습니다.')
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">마이페이지</h1>

      {error && <ErrorNote message={error} />}
      {notice && (
        <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          {notice}
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-semibold">프로필</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg bg-raised px-3 py-1.5 text-sm text-mute transition-colors hover:text-ink"
            >
              수정
            </button>
          )}
        </div>
        {editing ? (
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-mute">이름</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-mute">소개 (200자 이내)</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={3}
                className="mt-1.5 w-full resize-none rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
              >
                {saving ? '저장 중…' : '저장'}
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setName(user.name)
                  setBio(user.bio ?? '')
                }}
                className="rounded-xl bg-raised px-4 py-2 text-sm text-mute transition-colors hover:text-ink"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-1">
            <p className="text-lg font-bold">{user.name}</p>
            <p className="text-sm text-mute">{user.email}</p>
            {user.bio && <p className="pt-1 text-sm text-mute">{user.bio}</p>}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold">Solana 지갑</h2>
        {user.walletAddress ? (
          <div className="mt-3 flex items-center gap-3">
            <span className="rounded-lg bg-raised px-3 py-1.5 font-mono text-sm text-mute">
              {shortAddress(user.walletAddress, 6)}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              연결됨
            </span>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-mute">
              캠페인을 만들려면 지갑 연결이 필요합니다. 서명으로 소유권만 증명하며, 자금 접근 권한은 없습니다.
            </p>
            <button
              onClick={handleConnectWallet}
              disabled={connecting || !hasWallet()}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
            >
              {connecting ? '서명 대기 중…' : '지갑 연결하기'}
            </button>
            {!hasWallet() && (
              <p className="text-xs text-faint">Phantom 등 Solana 지갑 확장이 설치되어 있지 않습니다.</p>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold">내 기여 내역</h2>
        <div className="mt-4 space-y-3">
          {contributions === null ? (
            <Spinner />
          ) : contributions.length === 0 ? (
            <EmptyNote message="아직 기여한 캠페인이 없습니다." />
          ) : (
            contributions.map((c, i) => (
              <Link
                key={i}
                to={`/campaign/${c.campaignId}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-raised px-4 py-3 transition-colors hover:bg-line/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="mt-0.5 text-xs text-faint">{formatDateTime(c.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-accent">{formatUsdc(c.amount)}</span>
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold">기여 증서 (cNFT)</h2>
        <p className="mt-0.5 text-xs text-faint">캠페인 참여 증표가 지갑에 발행됩니다</p>
        <div className="mt-4 space-y-3">
          {certificates === null ? (
            <Spinner />
          ) : certificates.length === 0 ? (
            <EmptyNote message="아직 발행된 증서가 없습니다." />
          ) : (
            certificates.map((c) => (
              <div key={c.mintAddress} className="flex items-center justify-between gap-3 rounded-xl bg-raised px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.campaignTitle}</p>
                  <p className="mt-0.5 font-mono text-xs text-faint">{shortAddress(c.mintAddress, 6)}</p>
                </div>
                <span className="text-xs text-mute">{formatDate(c.issuedAt)}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={handleWithdraw}
          disabled={withdrawing}
          className="text-sm text-faint transition-colors hover:text-danger disabled:opacity-50"
        >
          {withdrawing ? '탈퇴 처리 중…' : '회원 탈퇴'}
        </button>
      </div>
    </div>
  )
}
