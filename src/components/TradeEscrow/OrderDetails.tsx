import { formatEther } from 'viem'
import { ORDER_STATE_LABELS, OrderState } from '../../types'
import type { Order } from '../../types'

interface OrderDetailsProps {
  order: Order
}

function shortenAddress(addr: string) {
  return `${addr.slice(0, 10)}...${addr.slice(-6)}`
}

function formatTimestamp(ts: bigint) {
  if (!ts || ts === 0n) return 'N/A'
  return new Date(Number(ts) * 1000).toLocaleString()
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="p-3 bg-gray-600 rounded mb-4">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-400">Buyer:</span>{' '}
          <span className="font-mono">{shortenAddress(order.buyer)}</span>
        </div>
        <div>
          <span className="text-gray-400">Vault:</span>{' '}
          <span className="font-mono">{shortenAddress(order.vault)}</span>
        </div>
        <div>
          <span className="text-gray-400">Token ID:</span> {order.tokenId.toString()}
        </div>
        <div>
          <span className="text-gray-400">Amount:</span> {formatEther(order.amount)} IDRP
        </div>
        <div>
          <span className="text-gray-400">State:</span>{' '}
          <span className="font-semibold">
            {ORDER_STATE_LABELS[order.state as OrderState] || 'Unknown'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Lock Duration:</span> {Number(order.lockDuration) / 86400} days
        </div>
        <div>
          <span className="text-gray-400">Created:</span> {formatTimestamp(order.createdAt)}
        </div>
        <div>
          <span className="text-gray-400">Expires:</span> {formatTimestamp(order.expiresAt)}
        </div>
        <div>
          <span className="text-gray-400">Funded At:</span> {formatTimestamp(order.fundedAt)}
        </div>
        <div>
          <span className="text-gray-400">Shipped At:</span> {formatTimestamp(order.shippedAt)}
        </div>
        <div>
          <span className="text-gray-400">Release At:</span> {formatTimestamp(order.releaseAt)}
        </div>
        {order.docsURI && (
          <div className="col-span-2">
            <span className="text-gray-400">Docs URI:</span>{' '}
            <span className="font-mono text-xs break-all">{order.docsURI}</span>
          </div>
        )}
      </div>
    </div>
  )
}
