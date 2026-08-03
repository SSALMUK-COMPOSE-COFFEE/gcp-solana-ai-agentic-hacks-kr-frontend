import type { ReactNode } from 'react'
import type { AgentRole, CampaignStatus, ProofStatus } from '../api'
import { progressPercent } from '../lib/format'

const statusStyles: Record<CampaignStatus, string> = {
  모금중: 'bg-primary/15 text-primary',
  집행중: 'bg-accent/15 text-accent',
  환불중: 'bg-warn/15 text-warn',
  종료: 'bg-faint/20 text-mute',
}

export function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  )
}

const proofStyles: Record<ProofStatus, string> = {
  검토중: 'bg-warn/15 text-warn',
  승인: 'bg-accent/15 text-accent',
  거절: 'bg-danger/15 text-danger',
}

export function ProofBadge({ status }: { status: ProofStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${proofStyles[status]}`}>
      {status}
    </span>
  )
}

export function ProgressBar({ raised, goal, tall = false }: { raised: number; goal: number; tall?: boolean }) {
  const pct = progressPercent(raised, goal)
  return (
    <div className={`w-full overflow-hidden rounded-full bg-raised ${tall ? 'h-2.5' : 'h-1.5'}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export const agentMeta: Record<AgentRole, { label: string; icon: string; duty: string }> = {
  orchestrator: { label: '오케스트레이터', icon: '🧭', duty: '정책 보유 · 전체 조율' },
  'vendor-negotiation': { label: '벤더 협상', icon: '🤝', duty: 'A2A 견적 협상' },
  'verify-audit': { label: '검증 · 감사', icon: '🔍', duty: '증빙 ↔ 지출 매칭' },
  'settlement-refund': { label: '정산 · 환불', icon: '💸', duty: 'release / refund 트리거' },
}

const FALLBACK_AGENT_META = { label: '알 수 없는 에이전트', icon: '🤖', duty: '' }

export function metaFor(role: string) {
  return agentMeta[role as AgentRole] ?? FALLBACK_AGENT_META
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-card ${className}`}>{children}</div>
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-mute">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-primary" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      {message}
    </div>
  )
}

export function EmptyNote({ message }: { message: string }) {
  return <div className="py-10 text-center text-sm text-faint">{message}</div>
}
