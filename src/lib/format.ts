const USDC = 1_000_000

export function toRawUnits(usdc: number): number {
  return Math.round(usdc * USDC)
}

export function formatUsdc(raw: number, options: { compact?: boolean } = {}): string {
  const value = raw / USDC
  if (options.compact && value >= 10_000) {
    return `${(value / 1000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}K USDC`
  }
  if (value !== 0 && Math.abs(value) < 0.01) {
    return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 6 })} USDC`
  }
  return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })} USDC`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRemaining(seconds: number): string {
  if (seconds <= 0) return '마감'
  const days = Math.floor(seconds / 86_400)
  if (days >= 1) return `D-${days}`
  const hours = Math.floor(seconds / 3600)
  if (hours >= 1) return `${hours}시간 남음`
  return `${Math.max(Math.floor(seconds / 60), 1)}분 남음`
}

export function remainingUntil(deadline: string): string {
  return formatRemaining(Math.floor((new Date(deadline).getTime() - Date.now()) / 1000))
}

const CLUSTER = import.meta.env.VITE_SOLANA_CLUSTER ?? 'devnet'

export function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`
}

export function shortAddress(address: string, edge = 4): string {
  if (address.length <= edge * 2 + 3) return address
  return `${address.slice(0, edge)}…${address.slice(-edge)}`
}

export function progressPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0
  return Math.min(Math.round((raised / goal) * 100), 100)
}
