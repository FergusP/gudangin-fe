import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, keccak256, toBytes } from 'viem'
import { contracts } from '../../config'
import TradeEscrowABI from '../../abi/TradeEscrow.json'

interface CreateOrderProps {
  vaultAddress: `0x${string}`
}

export function CreateOrder({ vaultAddress }: CreateOrderProps) {
  const [orderId, setOrderId] = useState('')
  const [buyer, setBuyer] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [amount, setAmount] = useState('')
  const [lockDuration, setLockDuration] = useState('259200') // 3 days default

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const isDisabled = isPending || isConfirming

  const handleCreate = () => {
    if (!orderId || !buyer || !tokenId || !amount) return

    const orderIdBytes = orderId.startsWith('0x') ? orderId : keccak256(toBytes(orderId))

    writeContract({
      address: contracts.TRADE_ESCROW as `0x${string}`,
      abi: TradeEscrowABI,
      functionName: 'createOrder',
      args: [
        orderIdBytes as `0x${string}`,
        buyer as `0x${string}`,
        vaultAddress,
        BigInt(tokenId),
        parseEther(amount),
        BigInt(lockDuration),
      ],
    })
  }

  return (
    <div className="p-3 bg-gray-700 rounded mb-4">
      <h4 className="font-medium mb-2">Create Order (Trader)</h4>
      <p className="text-gray-400 text-xs mb-3">
        Creates an escrow order for a buyer to purchase inventory from this vault.
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <input
          type="text"
          placeholder="Order ID (text or 0x...)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="px-3 py-2 bg-gray-600 rounded text-sm"
        />
        <input
          type="text"
          placeholder="Buyer address (0x...)"
          value={buyer}
          onChange={(e) => setBuyer(e.target.value)}
          className="px-3 py-2 bg-gray-600 rounded text-sm"
        />
        <input
          type="text"
          placeholder="Inventory Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="px-3 py-2 bg-gray-600 rounded text-sm"
        />
        <input
          type="text"
          placeholder="Amount (IDRP)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="px-3 py-2 bg-gray-600 rounded text-sm"
        />
        <input
          type="text"
          placeholder="Lock duration (seconds)"
          value={lockDuration}
          onChange={(e) => setLockDuration(e.target.value)}
          className="px-3 py-2 bg-gray-600 rounded text-sm"
        />
      </div>
      <button
        onClick={handleCreate}
        disabled={isDisabled || !orderId || !buyer || !tokenId || !amount}
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Create Order
      </button>
    </div>
  )
}
