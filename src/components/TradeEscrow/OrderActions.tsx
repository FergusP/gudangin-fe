import { useState } from 'react'
import { formatEther, keccak256, toBytes, type Abi } from 'viem'
import { contracts } from '../../config'
import TradeEscrowABI from '../../abi/TradeEscrow.json'
import IDRPABI from '../../abi/IDRP.json'
import type { Order } from '../../types'
import { OrderState } from '../../types'
import { useMetaTransaction } from '../../hooks'

const tradeEscrowAbi = TradeEscrowABI as Abi
const idrpAbi = IDRPABI as Abi

interface OrderActionsProps {
  orderId: `0x${string}`
  order: Order | undefined
}

export function OrderActions({ orderId, order }: OrderActionsProps) {
  const [shipDocsUri, setShipDocsUri] = useState('')
  const [disputeReason, setDisputeReason] = useState('')

  const { execute, status, txHash, error } = useMetaTransaction()

  const isLoading = status === 'signing' || status === 'relaying'

  const handleApproveIDRP = async () => {
    if (!order) return
    await execute({
      to: contracts.IDRP_TOKEN as `0x${string}`,
      abi: idrpAbi,
      functionName: 'approve',
      args: [contracts.TRADE_ESCROW as `0x${string}`, order.amount],
      gas: 100000n,
    })
  }

  const handleFund = async () => {
    await execute({
      to: contracts.TRADE_ESCROW as `0x${string}`,
      abi: tradeEscrowAbi,
      functionName: 'fund',
      args: [orderId],
      gas: 200000n,
    })
  }

  const handleMarkShipped = async () => {
    if (!shipDocsUri) return
    const docsHash = keccak256(toBytes(shipDocsUri))
    await execute({
      to: contracts.TRADE_ESCROW as `0x${string}`,
      abi: tradeEscrowAbi,
      functionName: 'markShipped',
      args: [orderId, shipDocsUri, docsHash],
      gas: 150000n,
    })
  }

  const handleRaiseDispute = async () => {
    if (!disputeReason) return
    const reasonHash = keccak256(toBytes(disputeReason))
    await execute({
      to: contracts.TRADE_ESCROW as `0x${string}`,
      abi: tradeEscrowAbi,
      functionName: 'raiseDispute',
      args: [orderId, reasonHash],
      gas: 150000n,
    })
  }

  const handleRelease = async () => {
    await execute({
      to: contracts.TRADE_ESCROW as `0x${string}`,
      abi: tradeEscrowAbi,
      functionName: 'release',
      args: [orderId],
      gas: 300000n,
    })
  }

  const canFund = order?.state === OrderState.CREATED
  const canShip = order?.state === OrderState.FUNDED
  const canDispute = order?.state === OrderState.SHIPPED
  const canRelease = order?.state === OrderState.SHIPPED

  const getStatusText = () => {
    if (status === 'signing') return 'Sign in wallet...'
    if (status === 'relaying') return 'Relaying...'
    if (status === 'success') return `Success! ${txHash?.slice(0, 10)}...`
    if (status === 'error') return `Error: ${error}`
    return null
  }

  const statusText = getStatusText()

  return (
    <div className="space-y-3">
      {statusText && (
        <div className={`text-sm p-2 rounded ${status === 'error' ? 'bg-red-900/50 text-red-400' : 'bg-gray-600 text-gray-300'}`}>
          {statusText}
        </div>
      )}

      {/* Fund Order */}
      <div className="flex gap-2">
        <button
          onClick={handleApproveIDRP}
          disabled={isLoading || !order || !canFund}
          className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          Approve {order ? formatEther(order.amount) : '0'} IDRP
        </button>
        <button
          onClick={handleFund}
          disabled={isLoading || !canFund}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Fund Order
        </button>
      </div>

      {/* Mark Shipped (Warehouse) */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Shipping docs URI"
          value={shipDocsUri}
          onChange={(e) => setShipDocsUri(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-600 rounded"
        />
        <button
          onClick={handleMarkShipped}
          disabled={isLoading || !shipDocsUri || !canShip}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Mark Shipped
        </button>
      </div>

      {/* Raise Dispute (Buyer) */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Dispute reason"
          value={disputeReason}
          onChange={(e) => setDisputeReason(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-600 rounded"
        />
        <button
          onClick={handleRaiseDispute}
          disabled={isLoading || !disputeReason || !canDispute}
          className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-50"
        >
          Raise Dispute
        </button>
      </div>

      {/* Release */}
      <button
        onClick={handleRelease}
        disabled={isLoading || !canRelease}
        className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        Release Funds
      </button>
    </div>
  )
}
