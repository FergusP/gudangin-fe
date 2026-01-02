import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { parseEther } from 'viem'
import VaultABI from '../../abi/Vault.json'
import GoodsTokenABI from '../../abi/GoodsToken.json'
import { contracts } from '../../config'
import type { VendorPayment } from '../../types'

interface RequestReleaseProps {
  vaultAddress: `0x${string}`
}

export function RequestRelease({ vaultAddress }: RequestReleaseProps) {
  const { address } = useAccount()
  const [tokenId, setTokenId] = useState('')
  const [vendors, setVendors] = useState<VendorPayment[]>([{ vendor: '', amount: '' }])

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Check if trader has approved vault for NFT transfers
  const { data: isApproved } = useReadContract({
    address: contracts.GOODS_TOKEN as `0x${string}`,
    abi: GoodsTokenABI,
    functionName: 'isApprovedForAll',
    args: address ? [address, vaultAddress] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: isConfirmed ? 1000 : false, // Refetch after tx confirms
    },
  })

  const isDisabled = isPending || isConfirming

  const addVendor = () => {
    setVendors([...vendors, { vendor: '', amount: '' }])
  }

  const removeVendor = (index: number) => {
    if (vendors.length > 1) {
      setVendors(vendors.filter((_, i) => i !== index))
    }
  }

  const updateVendor = (index: number, field: keyof VendorPayment, value: string) => {
    const updated = [...vendors]
    updated[index][field] = value
    setVendors(updated)
  }

  const handleApproveVault = () => {
    writeContract({
      address: contracts.GOODS_TOKEN as `0x${string}`,
      abi: GoodsTokenABI,
      functionName: 'setApprovalForAll',
      args: [vaultAddress, true],
    })
  }

  const handleRequestRelease = () => {
    if (!tokenId || vendors.some((v) => !v.vendor || !v.amount)) return

    const vendorAddresses = vendors.map((v) => v.vendor as `0x${string}`)
    const amounts = vendors.map((v) => parseEther(v.amount))

    writeContract({
      address: vaultAddress,
      abi: VaultABI,
      functionName: 'requestFundRelease',
      args: [BigInt(tokenId), vendorAddresses, amounts],
    })
  }

  const totalAmount = vendors.reduce((sum, v) => {
    try {
      return sum + (v.amount ? parseFloat(v.amount) : 0)
    } catch {
      return sum
    }
  }, 0)

  return (
    <div className="p-3 bg-gray-700 rounded mb-4">
      <h4 className="font-medium mb-2">Request Fund Release (Multi-Vendor)</h4>

      {/* One-time approval check */}
      {!isApproved && (
        <div className="mb-3 p-2 bg-yellow-900/30 border border-yellow-600 rounded">
          <p className="text-yellow-400 text-sm mb-2">
            Vault needs approval to transfer your inventory NFTs (one-time)
          </p>
          <button
            onClick={handleApproveVault}
            disabled={isDisabled}
            className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50 text-sm"
          >
            Approve Vault for NFT Transfers
          </button>
        </div>
      )}

      <div className="mb-3">
        <input
          type="text"
          placeholder="Inventory NFT Token ID (owned by you)"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="w-full px-3 py-2 bg-gray-600 rounded mb-2"
        />
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Vendor Payments</span>
          <button
            onClick={addVendor}
            className="px-2 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500"
          >
            + Add Vendor
          </button>
        </div>

        {vendors.map((v, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Vendor address (0x...)"
              value={v.vendor}
              onChange={(e) => updateVendor(i, 'vendor', e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-600 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Amount (IDRP)"
              value={v.amount}
              onChange={(e) => updateVendor(i, 'amount', e.target.value)}
              className="w-32 px-3 py-2 bg-gray-600 rounded text-sm"
            />
            {vendors.length > 1 && (
              <button
                onClick={() => removeVendor(i)}
                className="px-2 py-1 bg-red-600 rounded text-sm hover:bg-red-700"
              >
                X
              </button>
            )}
          </div>
        ))}

        <p className="text-sm text-gray-400">
          Total: {totalAmount.toLocaleString()} IDRP
        </p>
      </div>

      <button
        onClick={handleRequestRelease}
        disabled={isDisabled || !isApproved || !tokenId || vendors.some((v) => !v.vendor || !v.amount)}
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Request Release
      </button>
    </div>
  )
}
