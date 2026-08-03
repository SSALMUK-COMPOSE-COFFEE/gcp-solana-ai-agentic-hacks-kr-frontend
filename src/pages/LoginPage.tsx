import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { API_MODE } from '../api'
import { Card, ErrorNote } from '../components/ui'
import { useAuth } from '../store/auth'

export default function LoginPage() {
  const { login, loginWithWallet } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(API_MODE === 'mock' ? 'fan@example.com' : '')
  const [password, setPassword] = useState(API_MODE === 'mock' ? 'thisispassword' : '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [walletSubmitting, setWalletSubmitting] = useState(false)

  function goBack() {
    const from = (location.state as { from?: string } | null)?.from
    navigate(from ?? '/')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      goBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleWalletLogin() {
    setError(null)
    setWalletSubmitting(true)
    try {
      await loginWithWallet()
      goBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : '지갑 로그인에 실패했습니다.')
    } finally {
      setWalletSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 pt-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">로그인</h1>
        {API_MODE === 'mock' && (
          <p className="mt-1 text-sm text-mute">데모 계정이 미리 입력되어 있습니다</p>
        )}
      </div>

      {error && <ErrorNote message={error} />}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
          >
            {submitting ? '로그인 중…' : '로그인'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-faint">
          <span className="h-px flex-1 bg-line" />
          또는
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          onClick={handleWalletLogin}
          disabled={walletSubmitting}
          className="w-full rounded-xl border border-accent/40 py-3 font-semibold text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
        >
          {walletSubmitting ? '서명 대기 중…' : 'Solana 지갑으로 로그인'}
        </button>
        <p className="mt-2 text-center text-xs text-faint">
          마이페이지에서 지갑을 연결해둔 계정만 가능합니다
        </p>
      </Card>

      <p className="text-center text-sm text-mute">
        처음이신가요?{' '}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  )
}
