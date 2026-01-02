import { formatEther } from 'viem'
import { VAULT_STATE_LABELS, VaultState } from '../types'

interface VaultDetailsProps {
  address: `0x${string}`
  state: VaultState | undefined
  trader: `0x${string}` | undefined
  investor: `0x${string}` | undefined
  admin: `0x${string}` | undefined
  totalDeposited: bigint | undefined
  totalSpent: bigint | undefined
  totalSaleProceeds: bigint | undefined
  availableFunds: bigint | undefined
  maxDeposit: bigint | undefined
  collateralTokenId: bigint | undefined
  collateralValue: bigint | undefined
  investorProfitShareBps: bigint | undefined
  nextReleaseId: bigint | undefined
  pendingOrderCount: bigint | undefined
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

function shortenAddress(addr: string | undefined) {
  if (!addr) return 'N/A'
  if (addr === ZERO_ADDRESS) return 'None'
  return `${addr.slice(0, 10)}...`
}

export function VaultDetails(props: VaultDetailsProps) {
  const {
    address,
    state,
    trader,
    investor,
    admin,
    totalDeposited,
    totalSpent,
    totalSaleProceeds,
    availableFunds,
    maxDeposit,
    collateralTokenId,
    collateralValue,
    investorProfitShareBps,
    nextReleaseId,
    pendingOrderCount,
  } = props

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
      <div>
        <p className="text-gray-400 text-sm">Address</p>
        <p className="font-mono text-sm break-all">{address}</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">State</p>
        <p className="font-semibold">
          {state !== undefined ? VAULT_STATE_LABELS[state] : 'Loading...'}
        </p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Trader</p>
        <p className="font-mono text-sm">{shortenAddress(trader)}</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Investor</p>
        <p className="font-mono text-sm">{shortenAddress(investor)}</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Admin</p>
        <p className="font-mono text-sm">{shortenAddress(admin)}</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Collateral Token ID</p>
        <p>{collateralTokenId?.toString() ?? 'N/A'}</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Collateral Value</p>
        <p>{collateralValue ? formatEther(collateralValue) : '0'} IDRP</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Max Deposit (70% LTV)</p>
        <p>{maxDeposit ? formatEther(maxDeposit) : '0'} IDRP</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Total Deposited</p>
        <p>{totalDeposited ? formatEther(totalDeposited) : '0'} IDRP</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Available Funds</p>
        <p>{availableFunds ? formatEther(availableFunds) : '0'} IDRP</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Total Spent</p>
        <p>{totalSpent ? formatEther(totalSpent) : '0'} IDRP</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Sale Proceeds</p>
        <p>{totalSaleProceeds ? formatEther(totalSaleProceeds) : '0'} IDRP</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Investor Profit Share</p>
        <p>{investorProfitShareBps ? Number(investorProfitShareBps) / 100 : 0}%</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Next Release ID</p>
        <p>{nextReleaseId?.toString() ?? '0'}</p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">Pending Orders</p>
        <p>{pendingOrderCount?.toString() ?? '0'}</p>
      </div>
    </div>
  )
}
