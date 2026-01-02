import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import VaultABI from '../abi/Vault.json'
import IDRPABI from '../abi/IDRP.json'
import { contracts } from '../config'

interface VaultActionsProps {
  vaultAddress: `0x${string}`
}

export function VaultActions({ vaultAddress }: VaultActionsProps) {
  const [depositAmount, setDepositAmount] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const isDisabled = isPending || isConfirming

  const handleApproveIDRP = () => {
    if (!depositAmount) return
    writeContract({
      address: contracts.IDRP_TOKEN as `0x${string}`,
      abi: IDRPABI,
      functionName: 'approve',
      args: [vaultAddress, parseEther(depositAmount)],
    })
  }

  const handleDeposit = () => {
    if (!depositAmount) return
    writeContract({
      address: vaultAddress,
      abi: VaultABI,
      functionName: 'investorDeposit',
      args: [parseEther(depositAmount)],
    })
  }

  const handleEndVault = () => {
    writeContract({
      address: vaultAddress,
      abi: VaultABI,
      functionName: 'endVault',
    })
  }

  const handleLiquidate = () => {
    writeContract({
      address: vaultAddress,
      abi: VaultABI,
      functionName: 'liquidateToInvestor',
    })
  }

  return (
    <div className="border-t border-gray-600 pt-4">
      <h3 className="text-lg font-semibold mb-3">Vault Actions</h3>

      {/* Deposit */}
      <div className="mb-4 p-3 bg-gray-700 rounded">
        <h4 className="font-medium mb-2">Deposit (Investor)</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Amount (IDRP)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-600 rounded"
          />
          <button
            onClick={handleApproveIDRP}
            disabled={isDisabled || !depositAmount}
            className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={handleDeposit}
            disabled={isDisabled || !depositAmount}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Deposit
          </button>
        </div>
      </div>

      {/* End / Liquidate */}
      <div className="flex gap-2">
        <button
          onClick={handleEndVault}
          disabled={isDisabled}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          End Vault
        </button>
        <button
          onClick={handleLiquidate}
          disabled={isDisabled}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Liquidate to Investor
        </button>
      </div>
    </div>
  )
}
