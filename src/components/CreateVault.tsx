import { useState } from 'react'
import { parseEther, type Abi } from 'viem'
import { contracts } from '../config'
import VaultFactoryABI from '../abi/VaultFactory.json'
import GoodsTokenABI from '../abi/GoodsToken.json'
import { useMetaTransaction } from '../hooks'

const vaultFactoryAbi = VaultFactoryABI as Abi
const goodsTokenAbi = GoodsTokenABI as Abi

export function CreateVault() {
  const [tokenId, setTokenId] = useState('')
  const [collateralValue, setCollateralValue] = useState('')
  const [profitShare, setProfitShare] = useState('1000') // 10% default

  // Meta-tx for NFT approve (GoodsToken now supports ERC-2771)
  const {
    execute: executeApprove,
    status: approveStatus,
    error: approveError,
    reset: resetApprove,
  } = useMetaTransaction()

  // Meta-tx for createVault (VaultFactory supports ERC-2771)
  const {
    execute: executeCreate,
    status: createStatus,
    txHash,
    error: createError,
  } = useMetaTransaction()

  const isApproveLoading = approveStatus === 'signing' || approveStatus === 'relaying'
  const isCreateLoading = createStatus === 'signing' || createStatus === 'relaying'
  const isDisabled = isApproveLoading || isCreateLoading

  const handleApproveNFT = async () => {
    if (!tokenId) return
    resetApprove()
    await executeApprove({
      to: contracts.GOODS_TOKEN as `0x${string}`,
      abi: goodsTokenAbi,
      functionName: 'approve',
      args: [contracts.VAULT_FACTORY as `0x${string}`, BigInt(tokenId)],
      gas: 100000n,
    })
  }

  const handleCreateVault = async () => {
    if (!tokenId || !collateralValue || !profitShare) return
    await executeCreate({
      to: contracts.VAULT_FACTORY as `0x${string}`,
      abi: vaultFactoryAbi,
      functionName: 'createVaultWithCollateral',
      args: [BigInt(tokenId), parseEther(collateralValue), BigInt(profitShare)],
      gas: 3500000n, // Vault deployment needs ~3M gas
    })
  }

  const getApproveButtonText = () => {
    if (approveStatus === 'signing') return 'Sign in wallet...'
    if (approveStatus === 'relaying') return 'Relaying...'
    return '1. Approve NFT (Gasless)'
  }

  const getCreateButtonText = () => {
    if (createStatus === 'signing') return 'Sign in wallet...'
    if (createStatus === 'relaying') return 'Relaying...'
    return '2. Create Vault (Gasless)'
  }

  const getStatusText = () => {
    if (approveStatus === 'success') return 'NFT approved! Now create the vault.'
    if (createStatus === 'success') return `Success! ${txHash?.slice(0, 10)}...`
    if (approveError) return `Approve error: ${approveError}`
    if (createError) return `Create error: ${createError}`
    return null
  }

  const statusText = getStatusText()
  const hasError = approveError || createError

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
      <div className="flex gap-2 items-center">
        <button
          onClick={handleApproveNFT}
          disabled={isDisabled || !tokenId}
          className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {getApproveButtonText()}
        </button>
        <button
          onClick={handleCreateVault}
          disabled={isDisabled || !tokenId || !collateralValue}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {getCreateButtonText()}
        </button>
        {statusText && (
          <span className={`text-sm ${hasError ? 'text-red-400' : 'text-gray-400'}`}>
            {statusText}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-xs mt-2">
        Collateral value is in IDRP (e.g., 1000000 for 1M IDRP). Profit share is in basis points (1000 = 10%).
      </p>
    </div>
  )
}
