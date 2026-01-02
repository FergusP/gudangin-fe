// Relayer API service for meta-transactions

const RELAYER_URL = import.meta.env.VITE_RELAYER_URL || 'http://localhost:3000'

export interface ForwardRequest {
  from: string
  to: string
  value: string
  gas: string
  deadline: string
  data: string
  signature: string
}

export interface RelayResponse {
  success: boolean
  txHash?: string
  error?: string
}

export interface EIP712Domain {
  name: string
  version: string
  chainId: number
  verifyingContract: string
}

/**
 * Get EIP-712 domain from relayer
 */
export async function getEIP712Domain(): Promise<EIP712Domain> {
  const res = await fetch(`${RELAYER_URL}/api/domain`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Failed to get domain')
  return data.domain
}

/**
 * Get current nonce for an address
 */
export async function getNonce(address: string): Promise<string> {
  const res = await fetch(`${RELAYER_URL}/api/nonce/${address}`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Failed to get nonce')
  return data.nonce
}

/**
 * Submit a meta-transaction to the relayer
 */
export async function relay(request: ForwardRequest): Promise<RelayResponse> {
  const res = await fetch(`${RELAYER_URL}/api/relay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return res.json()
}

/**
 * Get relayer info (address, balance)
 */
export async function getRelayerInfo(): Promise<{
  address: string
  balance: string
  nonce: number
}> {
  const res = await fetch(`${RELAYER_URL}/api/info`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Failed to get relayer info')
  return data.relayer
}

/**
 * EIP-712 types for ForwardRequest
 */
export const ForwardRequestTypes = {
  ForwardRequest: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint48' },
    { name: 'data', type: 'bytes' },
  ],
} as const
