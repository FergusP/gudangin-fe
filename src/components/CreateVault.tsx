import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { contracts } from '../config'
import VaultFactoryABI from '../abi/VaultFactory.json'
import GoodsTokenABI from '../abi/GoodsToken.json'

export function CreateVault() {
  const [tokenId, setTokenId] = useState('')
  const [collateralValue, setCollateralValue] = useState('')
  const [profitShare, setProfitShare] = useState('1000') // 10% default

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  const handleApproveNFT = () => {
    if (!tokenId) return
    writeContract({
      address: contracts.GOODS_TOKEN as `0x${string}`,
      abi: GoodsTokenABI,
      functionName: 'approve',
      args: [contracts.VAULT_FACTORY as `0x${string}`, BigInt(tokenId)],
    })
  }

  const handleCreateVault = () => {
    if (!tokenId || !collateralValue || !profitShare) return
    writeContract({
      address: contracts.VAULT_FACTORY as `0x${string}`,
      abi: VaultFactoryABI,
      functionName: 'createVaultWithCollateral',
      args: [BigInt(tokenId), parseEther(collateralValue), BigInt(profitShare)],
    })
  }

  const isDisabled = isPending || isConfirming

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Create Vault (Trader)</h2>
      <p className="text-gray-400 text-sm mb-3">
        Requires owning a GoodsToken NFT as collateral. The NFT will be locked in the vault.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <input
          type="text"
          placeholder="Collateral Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="px-3 py-2 bg-gray-700 rounded"
        />
        <input
          type="text"
          placeholder="Collateral Value (IDRP)"
          value={collateralValue}
          onChange={(e) => setCollateralValue(e.target.value)}
          className="px-3 py-2 bg-gray-700 rounded"
        />
        <input
          type="text"
          placeholder="Investor Profit Share (bps)"
          value={profitShare}
          onChange={(e) => setProfitShare(e.target.value)}
          className="px-3 py-2 bg-gray-700 rounded"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleApproveNFT}
          disabled={isDisabled || !tokenId}
          className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          1. Approve NFT
        </button>
        <button
          onClick={handleCreateVault}
          disabled={isDisabled || !tokenId || !collateralValue}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        >
          2. Create Vault
        </button>
      </div>
      <p className="text-gray-500 text-xs mt-2">
        Collateral value is in IDRP (e.g., 1000000 for 1M IDRP). Profit share is in basis points (1000 = 10%).
      </p>
    </div>
  )
}
