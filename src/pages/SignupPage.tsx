import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, ErrorNote } from '../components/ui'
import { useAuth } from '../store/auth'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError('이름·이메일을 입력하고 비밀번호는 8자 이상으로 해주세요.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await signup(email, password, name.trim())
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 pt-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="mt-1 text-sm text-mute">팬으로 기여하거나, 총대로 캠페인을 열 수 있어요</p>
      </div>

      {error && <ErrorNote message={error} />}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 / 닉네임"
            className="w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
          />
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
            placeholder="비밀번호 (8자 이상)"
            className="w-full rounded-xl bg-raised px-4 py-2.5 outline-none ring-primary/60 transition-shadow focus:ring-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
          >
            {submitting ? '가입 중…' : '가입하기'}
          </button>
        </form>
      </Card>

      <p className="text-center text-sm text-mute">
        이미 계정이 있나요?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
