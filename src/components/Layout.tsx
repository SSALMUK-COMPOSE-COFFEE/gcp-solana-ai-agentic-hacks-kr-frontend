import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { API_MODE } from '../api'
import { useAuth } from '../store/auth'

function navClass({ isActive }: { isActive: boolean }): string {
  return `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-raised text-ink' : 'text-mute hover:text-ink'
  }`
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-sm text-white">총</span>
              총대
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </Link>
            <nav className="flex items-center gap-1">
              <NavLink to="/" end className={navClass}>
                캠페인
              </NavLink>
              <NavLink to="/dashboard" className={navClass}>
                총대 대시보드
              </NavLink>
              <NavLink to="/vendors" className={navClass}>
                벤더
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {API_MODE === 'mock' && (
              <span className="rounded-full border border-warn/40 px-2 py-0.5 text-[11px] font-semibold text-warn">
                MOCK
              </span>
            )}
            {user ? (
              <>
                <Link to="/me" className="text-sm font-medium text-mute transition-colors hover:text-ink">
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-1.5 text-sm text-mute transition-colors hover:text-ink"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm text-mute transition-colors hover:text-ink">
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
                >
                  시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-line py-8 text-center text-xs text-faint">
        총대 — 팬덤 에스크로 에이전트 · Solana Devnet · GCP × Solana AI Agentic Hackathon
      </footer>
    </div>
  )
}
