// Vault state constants (matches contract)
export const VaultState = {
  OPEN: 0,
  FUNDED: 1,
  ACTIVE: 2,
  EXPIRED: 3,
} as const

export type VaultState = (typeof VaultState)[keyof typeof VaultState]

export const VAULT_STATE_LABELS: Record<VaultState, string> = {
  [VaultState.OPEN]: 'Open',
  [VaultState.FUNDED]: 'Funded',
  [VaultState.ACTIVE]: 'Active',
  [VaultState.EXPIRED]: 'Expired',
}

// Order state constants (matches contract)
export const OrderState = {
  CREATED: 0,
  FUNDED: 1,
  SHIPPED: 2,
  DISPUTED: 3,
  RELEASED: 4,
  REFUNDED: 5,
  EXPIRED: 6,
} as const

export type OrderState = (typeof OrderState)[keyof typeof OrderState]

export const ORDER_STATE_LABELS: Record<OrderState, string> = {
  [OrderState.CREATED]: 'Created',
  [OrderState.FUNDED]: 'Funded',
  [OrderState.SHIPPED]: 'Shipped',
  [OrderState.DISPUTED]: 'Disputed',
  [OrderState.RELEASED]: 'Released',
  [OrderState.REFUNDED]: 'Refunded',
  [OrderState.EXPIRED]: 'Expired',
}

// Dispute outcome constants
export const DisputeOutcome = {
  REFUND: 0,
  RELEASE: 1,
  SPLIT: 2,
} as const

export type DisputeOutcome = (typeof DisputeOutcome)[keyof typeof DisputeOutcome]

// Vault details type
export interface VaultDetails {
  state: VaultState
  trader: `0x${string}`
  investor: `0x${string}`
  admin: `0x${string}`
  collateralTokenId: bigint
  collateralValue: bigint
  totalDeposited: bigint
  totalSpent: bigint
  totalSaleProceeds: bigint
  investorProfitShareBps: bigint
  nextReleaseId: bigint
  pendingOrderCount: bigint
  availableFunds: bigint
  maxDeposit: bigint
}

// Fund release type (multi-vendor)
export interface FundRelease {
  tokenId: bigint
  vendors: `0x${string}`[]
  amounts: bigint[]
  totalAmount: bigint
  approvalCount: number
  executed: boolean
  cancelled: boolean
}

// Order type
export interface Order {
  buyer: `0x${string}`
  vault: `0x${string}`
  tokenId: bigint
  amount: bigint
  lockDuration: bigint
  createdAt: bigint
  expiresAt: bigint
  fundedAt: bigint
  shippedAt: bigint
  releaseAt: bigint
  docsURI: string
  docsHash: `0x${string}`
  disputeReasonHash: `0x${string}`
  state: OrderState
}

// Vendor payment entry for fund release form
export interface VendorPayment {
  vendor: string
  amount: string
}
