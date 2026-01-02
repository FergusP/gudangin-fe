import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, keccak256, toBytes } from 'viem'
import { contracts } from '../../config'
import TradeEscrowABI from '../../abi/TradeEscrow.json'
import IDRPABI from '../../abi/IDRP.json'
import type { Order } from '../../types'
import { OrderState } from '../../types'

interface OrderActionsProps {
  orderId: `0x${string}`
  order: Order | undefined
}

export function OrderActions({ orderId, order }: OrderActionsProps) {
  const [shipDocsUri, setShipDocsUri] = useState('')
  const [disputeReason, setDisputeReason] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const isDisabled = isPending || isConfirming

  const handleApproveIDRP = () => {
    if (!order) return
    writeContract({
      address: contracts.IDRP_TOKEN as `0x${string}`,
      abi: IDRPABI,
      functionName: 'approve',
      args: [contracts.TRADE_ESCROW as `0x${string}`, order.amount],
    })
  }

  const handleFund = () => {
    writeContract({
      address: contracts.TRADE_ESCROW as `0x${string}`,
      abi: TradeEscrowABI,
      functionName: 'fund',
      args: [orderId],
    })
  }

  const handleMarkShipped = () => {
    if (!shipDocsUri) return
    const docsHash = keccak256(toBytes(shipDocsUri))
    writeContract({
      address: contracts.TRADE_ESCROW as `0x${string}`,
      abi: TradeEscrowABI,
      functionName: 'markShipped',
      args: [orderId, shipDocsUri, docsHash],
    })
  }

  const handleRaiseDispute = () => {
    if (!disputeReason) return
    const reasonHash = keccak256(toBytes(disputeReason))
    writeContract({
      address: contracts.TRADE_ESCROW as `0x${string}`,
      abi: TradeEscrowABI,
      functionName: 'raiseDispute',
      args: [orderId, reasonHash],
    })
  }

  const handleRelease = () => {
    writeContract({
      address: contracts.TRADE_ESCROW as `0x${string}`,
      abi: TradeEscrowABI,
      functionName: 'release',
      args: [orderId],
    })
  }

  const canFund = order?.state === OrderState.CREATED
  const canShip = order?.state === OrderState.FUNDED
  const canDispute = order?.state === OrderState.SHIPPED
  const canRelease = order?.state === OrderState.SHIPPED

  return (
    <div className="space-y-3">
      {/* Fund Order */}
      <div className="flex gap-2">
        <button
          onClick={handleApproveIDRP}
          disabled={isDisabled || !order || !canFund}
          className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          Approve {order ? formatEther(order.amount) : '0'} IDRP
        </button>
        <button
          onClick={handleFund}
          disabled={isDisabled || !canFund}
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
          disabled={isDisabled || !shipDocsUri || !canShip}
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
          disabled={isDisabled || !disputeReason || !canDispute}
          className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-50"
        >
          Raise Dispute
        </button>
      </div>

      {/* Release */}
      <button
        onClick={handleRelease}
        disabled={isDisabled || !canRelease}
        className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        Release Funds
      </button>
    </div>
  )
}
