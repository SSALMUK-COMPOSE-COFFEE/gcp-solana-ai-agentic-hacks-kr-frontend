import { API_MODE } from '../api'
import { base58Encode } from './base58'

interface SolanaProvider {
  isPhantom?: boolean
  connect(): Promise<{ publicKey: { toString(): string } }>
  signMessage(message: Uint8Array, display?: string): Promise<{ signature: Uint8Array }>
}

declare global {
  interface Window {
    solana?: SolanaProvider
  }
}

const MOCK_WALLET_KEY = 'chongdae.mockWallet'

function mockWalletAddress(): string {
  const stored = localStorage.getItem(MOCK_WALLET_KEY)
  if (stored) return stored
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let address = ''
  for (let i = 0; i < 44; i += 1) address += chars[Math.floor(Math.random() * chars.length)]
  localStorage.setItem(MOCK_WALLET_KEY, address)
  return address
}

export function hasWallet(): boolean {
  return API_MODE === 'mock' || Boolean(window.solana)
}

export async function connectWallet(): Promise<string> {
  if (window.solana) {
    const { publicKey } = await window.solana.connect()
    return publicKey.toString()
  }
  if (API_MODE === 'mock') return mockWalletAddress()
  throw new Error('Solana 지갑을 찾을 수 없습니다. Phantom 등 지갑 확장을 설치해주세요.')
}

export async function signNonce(nonce: string): Promise<string> {
  if (window.solana) {
    const { signature } = await window.solana.signMessage(new TextEncoder().encode(nonce), 'utf8')
    return base58Encode(signature)
  }
  if (API_MODE === 'mock') {
    return base58Encode(crypto.getRandomValues(new Uint8Array(64)))
  }
  throw new Error('Solana 지갑을 찾을 수 없습니다.')
}
