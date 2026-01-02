import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import VaultABI from '../../abi/Vault.json'

interface ManageReleaseProps {
  vaultAddress: `0x${string}`
}

export function ManageRelease({ vaultAddress }: ManageReleaseProps) {
  const [releaseId, setReleaseId] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const isDisabled = isPending || isConfirming

  const handleApprove = () => {
    if (!releaseId) return
    writeContract({
      address: vaultAddress,
      abi: VaultABI,
      functionName: 'approveFundRelease',
      args: [BigInt(releaseId)],
    })
  }

  const handleCancel = () => {
    if (!releaseId) return
    writeContract({
      address: vaultAddress,
      abi: VaultABI,
      functionName: 'cancelFundRelease',
      args: [BigInt(releaseId)],
    })
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
          Approve
        </button>
        <button
          onClick={handleCancel}
          disabled={isDisabled || !releaseId}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      <p className="text-gray-500 text-xs mt-2">
        Requires 2-of-3 approvals from trader, investor, or admin to execute.
      </p>
    </div>
  )
}
