import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
  stack: string
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, stack: '' }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('render error', error, info)
    this.setState({ stack: info.componentStack ?? '' })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen bg-bg p-6 text-ink">
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-xl font-bold text-danger">화면을 그리는 중 오류가 발생했습니다</h1>
          <p className="text-sm text-mute">
            아래 내용을 개발자에게 전달해 주세요. 새로고침하면 다시 시도합니다.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-line bg-card p-4 text-xs text-ink">
            {this.state.error.message}
          </pre>
          {this.state.stack && (
            <pre className="max-h-64 overflow-auto rounded-lg border border-line bg-card p-4 text-[11px] text-mute">
              {this.state.stack.trim()}
            </pre>
          )}
          <button
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg"
            onClick={() => {
              localStorage.removeItem('chongdae.auth')
              location.reload()
            }}
          >
            로그인 정보 지우고 새로고침
          </button>
        </div>
      </div>
    )
  }
}
