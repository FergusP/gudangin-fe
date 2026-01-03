import { useState } from 'react'
import { type Abi } from 'viem'
import VaultABI from '../../abi/Vault.json'
import { useMetaTransaction } from '../../hooks/useMetaTransaction'

const vaultAbi = VaultABI as Abi

interface ManageReleaseProps {
  vaultAddress: `0x${string}`
}

export function ManageRelease({ vaultAddress }: ManageReleaseProps) {
  const [releaseId, setReleaseId] = useState('')

  // Meta-tx for approve/cancel (Vault supports ERC-2771)
  const { execute, status, error, reset } = useMetaTransaction()

  const isDisabled = status === 'signing' || status === 'relaying'

  const handleApprove = async () => {
    if (!releaseId) return
    reset()
    await execute({
      to: vaultAddress,
      abi: vaultAbi,
      functionName: 'approveFundRelease',
      args: [BigInt(releaseId)],
      gas: 300000n,
    })
  }

  const handleCancel = async () => {
    if (!releaseId) return
    reset()
    await execute({
      to: vaultAddress,
      abi: vaultAbi,
      functionName: 'cancelFundRelease',
      args: [BigInt(releaseId)],
      gas: 100000n,
    })
  }

  const getButtonText = (action: string) => {
    if (status === 'signing') return 'Sign in wallet...'
    if (status === 'relaying') return 'Relaying...'
    return `${action} (Gasless)`
  }

  return (
    <div className="p-3 bg-gray-700 rounded">
      <h4 className="font-medium mb-2">Approve/Cancel Fund Release</h4>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Release ID"
          value={releaseId}
          onChange={(e) => setReleaseId(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-600 rounded"
        />
        <button
          onClick={handleApprove}
          disabled={isDisabled || !releaseId}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {getButtonText('Approve')}
        </button>
        <button
          onClick={handleCancel}
          disabled={isDisabled || !releaseId}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {getButtonText('Cancel')}
        </button>
      </div>
      <p className="text-gray-500 text-xs mt-2">
        Requires 2-of-3 approvals from trader, investor, or admin to execute.
      </p>
      {status === 'success' && (
        <p className="text-green-400 text-sm mt-2">Transaction successful!</p>
      )}
      {error && (
        <p className="text-red-400 text-sm mt-2">Error: {error}</p>
      )}
    </div>
  )
}
