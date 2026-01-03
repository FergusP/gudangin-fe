import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, type Abi } from 'viem'
import VaultABI from '../abi/Vault.json'
import IDRPABI from '../abi/IDRP.json'
import { contracts } from '../config'
import { useMetaTransaction } from '../hooks'

const vaultAbi = VaultABI as Abi

interface VaultActionsProps {
  vaultAddress: `0x${string}`
}

export function VaultActions({ vaultAddress }: VaultActionsProps) {
  const [depositAmount, setDepositAmount] = useState('')

  // Direct tx for IDRP approve (token doesn't support ERC-2771)
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  // Meta-tx for Vault actions (Vault supports ERC-2771)
  const { execute, status, txHash, error } = useMetaTransaction()

  const isMetaTxLoading = status === 'signing' || status === 'relaying'
  const isApproveLoading = isPending || isConfirming

  const handleApproveIDRP = () => {
    if (!depositAmount) return
    writeContract({
      address: contracts.IDRP_TOKEN as `0x${string}`,
      abi: IDRPABI,
      functionName: 'approve',
      args: [vaultAddress, parseEther(depositAmount)],
    })
  }

  const handleDeposit = async () => {
    if (!depositAmount) return
    await execute({
      to: vaultAddress,
      abi: vaultAbi,
      functionName: 'investorDeposit',
      args: [parseEther(depositAmount)],
      gas: 200000n,
    })
  }

  const handleEndVault = async () => {
    await execute({
      to: vaultAddress,
      abi: vaultAbi,
      functionName: 'endVault',
      args: [],
      gas: 300000n,
    })
  }

  const handleLiquidate = async () => {
    await execute({
      to: vaultAddress,
      abi: vaultAbi,
      functionName: 'liquidateToInvestor',
      args: [],
      gas: 300000n,
    })
  }

  const getStatusText = () => {
    if (isApproveLoading) return 'Approving IDRP...'
    if (status === 'signing') return 'Sign in wallet...'
    if (status === 'relaying') return 'Relaying...'
    if (status === 'success') return `Success! ${txHash?.slice(0, 10)}...`
    if (status === 'error') return `Error: ${error}`
    return null
  }

  const statusText = getStatusText()
  const isDisabled = isMetaTxLoading || isApproveLoading

  return (
    <div className="border-t border-gray-600 pt-4">
      <h3 className="text-lg font-semibold mb-3">Vault Actions</h3>

      {statusText && (
        <div className={`text-sm p-2 rounded mb-3 ${status === 'error' ? 'bg-red-900/50 text-red-400' : 'bg-gray-600 text-gray-300'}`}>
          {statusText}
        </div>
      )}

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
