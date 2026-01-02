import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseEther, keccak256, toBytes } from 'viem'
import { contracts } from './config'
import VaultABI from './abi/Vault.json'
import VaultFactoryABI from './abi/VaultFactory.json'
import TradeEscrowABI from './abi/TradeEscrow.json'
import IDRPABI from './abi/IDRP.json'
import GoodsTokenABI from './abi/GoodsToken.json'
import { useVaults, useVaultDetails, useNftMetadata, useOrder, useIdrpBalance } from './hooks'

const VAULT_STATES = ['AwaitingDeposit', 'Active', 'Ended', 'Liquidated']
const ORDER_STATES = ['None', 'Created', 'Funded', 'Shipped', 'Released', 'Disputed', 'Refunded', 'Resolved']

function App() {
  const { address, isConnected } = useAccount()
  const [selectedVault, setSelectedVault] = useState<`0x${string}` | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [releaseTokenId, setReleaseTokenId] = useState('')
  const [releaseId, setReleaseId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [orderBuyer, setOrderBuyer] = useState('')
  const [orderTokenId, setOrderTokenId] = useState('')
  const [orderAmount, setOrderAmount] = useState('')
  const [orderLockDuration, setOrderLockDuration] = useState('604800') // 7 days default
  const [viewOrderId, setViewOrderId] = useState('')
  const [shipDocsUri, setShipDocsUri] = useState('')
  const [disputeReason, setDisputeReason] = useState('')
  const [createVaultTokenId, setCreateVaultTokenId] = useState('')
  const [createVaultProfitShare, setCreateVaultProfitShare] = useState('1000') // 10% default

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  // Custom hooks for contract reads
  const { vaults, refetch: refetchVaults, isRefetching } = useVaults()
  const vault = useVaultDetails(selectedVault)
  const releaseNft = useNftMetadata(releaseTokenId)
  const { order: orderData, refetch: refetchOrder } = useOrder(viewOrderId)
  const idrpBalance = useIdrpBalance(address)

  // Actions
  const handleApproveIDRP = (spender: string, amount: string) => {
    writeContract({
      address: contracts.IDRP_TOKEN as `0x${string}`,
      abi: IDRPABI,
      functionName: 'approve',
      args: [spender as `0x${string}`, parseEther(amount)],
    })
  }

  const handleDeposit = () => {
    if (!selectedVault || !depositAmount) return
    writeContract({
      address: selectedVault,
      abi: VaultABI,
      functionName: 'investorDeposit',
      args: [parseEther(depositAmount)],
    })
  }

  const handleEndVault = () => {
    if (!selectedVault) return
    writeContract({
      address: selectedVault,
      abi: VaultABI,
      functionName: 'endVault',
    })
  }

  const handleLiquidate = () => {
    if (!selectedVault) return
    writeContract({
      address: selectedVault,
      abi: VaultABI,
      functionName: 'liquidateToInvestor',
    })
  }

  const handleRequestFundRelease = () => {
    if (!selectedVault || !releaseTokenId) return
    writeContract({
      address: selectedVault,
      abi: VaultABI,
      functionName: 'requestFundRelease',
      args: [BigInt(releaseTokenId)],
    })
  }

  const handleApproveFundRelease = () => {
    if (!selectedVault || !releaseId) return
    writeContract({
      address: selectedVault,
      abi: VaultABI,
      functionName: 'approveFundRelease',
      args: [BigInt(releaseId)],
    })
  }

  const handleCancelFundRelease = () => {
    if (!selectedVault || !releaseId) return
    writeContract({
      address: selectedVault,
      abi: VaultABI,
      functionName: 'cancelFundRelease',
      args: [BigInt(releaseId)],
    })
  }

  // Order actions
  const handleCreateOrder = () => {
    if (!orderId || !orderBuyer || !selectedVault || !orderTokenId || !orderAmount) return
    const orderIdBytes = orderId.startsWith('0x') ? orderId : keccak256(toBytes(orderId))
    writeContract({
      address: contracts.TRADE_ESCROW as `0x${string}`,
      abi: TradeEscrowABI,
      functionName: 'createOrder',
      args: [
        orderIdBytes as `0x${string}`,
        orderBuyer as `0x${string}`,
        selectedVault,
        BigInt(orderTokenId),
        parseEther(orderAmount),
        BigInt(orderLockDuration),
      ],
    })
  }

  const handleFundOrder = () => {
    if (!viewOrderId) return
    writeContract({
      address: contracts.TRADE_ESCROW as `0x${string}`,
      abi: TradeEscrowABI,
      functionName: 'fund',
      args: [viewOrderId as `0x${string}`],
    })
  }

  const handleMarkShipped = () => {
    if (!viewOrderId || !shipDocsUri) return
    const docsHash = keccak256(toBytes(shipDocsUri))
    writeContract({
      address: contracts.TRADE_ESCROW as `0x${string}`,
      abi: TradeEscrowABI,
      functionName: 'markShipped',
      args: [viewOrderId as `0x${string}`, shipDocsUri, docsHash],
    })
  }

  const handleRaiseDispute = () => {
    if (!viewOrderId || !disputeReason) return
    const reasonHash = keccak256(toBytes(disputeReason))
    writeContract({
      address: contracts.TRADE_ESCROW as `0x${string}`,
      abi: TradeEscrowABI,
      functionName: 'raiseDispute',
      args: [viewOrderId as `0x${string}`, reasonHash],
    })
  }

  const handleReleaseOrder = () => {
    if (!viewOrderId) return
    writeContract({
      address: contracts.TRADE_ESCROW as `0x${string}`,
      abi: TradeEscrowABI,
      functionName: 'release',
      args: [viewOrderId as `0x${string}`],
    })
  }

  const handleApproveNFT = () => {
    if (!createVaultTokenId) return
    writeContract({
      address: contracts.GOODS_TOKEN as `0x${string}`,
      abi: GoodsTokenABI,
      functionName: 'approve',
      args: [contracts.VAULT_FACTORY as `0x${string}`, BigInt(createVaultTokenId)],
    })
  }

  const handleCreateVault = () => {
    if (!createVaultTokenId || !createVaultProfitShare) return
    writeContract({
      address: contracts.VAULT_FACTORY as `0x${string}`,
      abi: VaultFactoryABI,
      functionName: 'createVaultWithCollateral',
      args: [BigInt(createVaultTokenId), BigInt(createVaultProfitShare)],
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Escrow Dashboard</h1>
          <ConnectButton />
        </div>

        {!isConnected ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Connect your wallet to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wallet Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Wallet Info</h2>
              <p className="text-gray-400">IDRP Balance: {idrpBalance ? formatEther(idrpBalance) : '0'} IDRP</p>
            </div>

            {/* Create Vault Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Create Vault (Trader)</h2>
              <p className="text-gray-400 text-sm mb-3">
                Requires owning a GoodsToken NFT as collateral. The NFT will be locked in the vault.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Collateral Token ID"
                  value={createVaultTokenId}
                  onChange={(e) => setCreateVaultTokenId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 rounded"
                />
                <input
                  type="text"
                  placeholder="Investor Profit Share (bps)"
                  value={createVaultProfitShare}
                  onChange={(e) => setCreateVaultProfitShare(e.target.value)}
                  className="w-48 px-3 py-2 bg-gray-700 rounded"
                />
                <button
                  onClick={handleApproveNFT}
                  disabled={isPending || isConfirming}
                  className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  Approve NFT
                </button>
                <button
                  onClick={handleCreateVault}
                  disabled={isPending || isConfirming}
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Create Vault
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Profit share is in basis points (1000 = 10%). This is the investor's share of profits.
              </p>
            </div>

            {/* Vaults Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Vaults</h2>
                <button
                  onClick={() => refetchVaults()}
                  disabled={isRefetching}
                  className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRefetching ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              <div className="grid gap-2">
                {(vaults || []).map((vaultAddr, i) => (
                  <div key={vaultAddr} className="rounded overflow-hidden">
                    <button
                      onClick={() => setSelectedVault(selectedVault === vaultAddr ? null : vaultAddr)}
                      className={`w-full text-left p-3 flex justify-between items-center ${
                        selectedVault === vaultAddr ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <span className="font-mono text-sm">Vault {i}: {vaultAddr.slice(0, 10)}...{vaultAddr.slice(-8)}</span>
                      <span className="text-gray-400">{selectedVault === vaultAddr ? '▲' : '▼'}</span>
                    </button>
                    {selectedVault === vaultAddr && (
                      <div className="bg-gray-800 border-t border-gray-600 p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-gray-400 text-sm">Address</p>
                            <p className="font-mono text-sm break-all">{selectedVault}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">State</p>
                            <p className="font-semibold">{VAULT_STATES[Number(vault.state ?? 0)]}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Trader</p>
                            <p className="font-mono text-sm">{vault.trader?.slice(0, 10)}...</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Investor</p>
                            <p className="font-mono text-sm">
                              {vault.investor === '0x0000000000000000000000000000000000000000'
                                ? 'None'
                                : `${vault.investor?.slice(0, 10)}...`}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Total Deposited</p>
                            <p>{vault.totalDeposited ? formatEther(vault.totalDeposited) : '0'} IDRP</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Available Funds</p>
                            <p>{vault.availableFunds ? formatEther(vault.availableFunds) : '0'} IDRP</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Max Deposit (LTV)</p>
                            <p>{vault.maxDeposit ? formatEther(vault.maxDeposit) : '0'} IDRP</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Collateral Token ID</p>
                            <p>{vault.collateralTokenId?.toString() ?? 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Collateral Value</p>
                            <p>{vault.collateralValue ? formatEther(vault.collateralValue) : '0'} IDRP</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Investor Profit Share</p>
                            <p>{vault.investorProfitShareBps ? Number(vault.investorProfitShareBps) / 100 : 0}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Next Release ID</p>
                            <p>{vault.nextReleaseId?.toString() ?? '0'}</p>
                          </div>
                        </div>

                        {/* Vault Actions */}
                        <div className="border-t border-gray-600 pt-4">
                          <h3 className="text-lg font-semibold mb-3">Actions</h3>

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
                                onClick={() => handleApproveIDRP(selectedVault, depositAmount)}
                                disabled={isPending || isConfirming}
                                className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={handleDeposit}
                                disabled={isPending || isConfirming}
                                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Deposit
                              </button>
                            </div>
                          </div>

                          {/* End / Liquidate */}
                          <div className="flex gap-2 mb-4">
                            <button
                              onClick={handleEndVault}
                              disabled={isPending || isConfirming}
                              className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
                            >
                              End Vault
                            </button>
                            <button
                              onClick={handleLiquidate}
                              disabled={isPending || isConfirming}
                              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              Liquidate to Investor
                            </button>
                          </div>

                          {/* Fund Releases */}
                          <div className="p-3 bg-gray-700 rounded mb-4">
                            <h4 className="font-medium mb-2">Request Fund Release (NFT-based)</h4>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                placeholder="Vendor NFT Token ID"
                                value={releaseTokenId}
                                onChange={(e) => setReleaseTokenId(e.target.value)}
                                className="flex-1 px-3 py-2 bg-gray-600 rounded"
                              />
                              <button
                                onClick={handleRequestFundRelease}
                                disabled={isPending || isConfirming || !releaseTokenId}
                                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                              >
                                Request Release
                              </button>
                            </div>
                            {releaseTokenId && (releaseNft.vendor !== undefined || releaseNft.value !== undefined) && (
                              <div className="p-2 bg-gray-600 rounded text-sm">
                                <p><span className="text-gray-400">Vendor:</span> <span className="font-mono">{releaseNft.vendor ? `${releaseNft.vendor.slice(0, 10)}...${releaseNft.vendor.slice(-8)}` : 'Loading...'}</span></p>
                                <p><span className="text-gray-400">Value:</span> {releaseNft.value ? formatEther(releaseNft.value) : '0'} IDRP</p>
                              </div>
                            )}
                          </div>

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
                                onClick={handleApproveFundRelease}
                                disabled={isPending || isConfirming}
                                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={handleCancelFundRelease}
                                disabled={isPending || isConfirming}
                                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {(!vaults || vaults.length === 0) && (
                  <p className="text-gray-400">No vaults found</p>
                )}
              </div>
            </div>

            {/* Trade Escrow Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Trade Escrow</h2>

              {/* Create Order */}
              {selectedVault && (
                <div className="p-3 bg-gray-700 rounded mb-4">
                  <h4 className="font-medium mb-2">Create Order (for selected vault)</h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Order ID (text or 0x...)"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="px-3 py-2 bg-gray-600 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Buyer address"
                      value={orderBuyer}
                      onChange={(e) => setOrderBuyer(e.target.value)}
                      className="px-3 py-2 bg-gray-600 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Token ID"
                      value={orderTokenId}
                      onChange={(e) => setOrderTokenId(e.target.value)}
                      className="px-3 py-2 bg-gray-600 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Amount (IDRP)"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      className="px-3 py-2 bg-gray-600 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Lock duration (seconds)"
                      value={orderLockDuration}
                      onChange={(e) => setOrderLockDuration(e.target.value)}
                      className="px-3 py-2 bg-gray-600 rounded"
                    />
                  </div>
                  <button
                    onClick={handleCreateOrder}
                    disabled={isPending || isConfirming}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create Order
                  </button>
                </div>
              )}

              {/* View / Manage Order */}
              <div className="p-3 bg-gray-700 rounded">
                <h4 className="font-medium mb-2">View / Manage Order</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Order ID (0x...)"
                    value={viewOrderId}
                    onChange={(e) => setViewOrderId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-600 rounded"
                  />
                  <button
                    onClick={() => refetchOrder()}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Load
                  </button>
                </div>

                {orderData ? (
                  <div className="mb-4 p-3 bg-gray-600 rounded">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Buyer:</span>{' '}
                        <span className="font-mono">{String((orderData as any).buyer ?? '').slice(0, 10)}...</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Vault:</span>{' '}
                        <span className="font-mono">{String((orderData as any).vault ?? '').slice(0, 10)}...</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Token ID:</span> {String((orderData as any).tokenId ?? '')}
                      </div>
                      <div>
                        <span className="text-gray-400">Amount:</span>{' '}
                        {(orderData as any).amount ? formatEther((orderData as any).amount) : '0'} IDRP
                      </div>
                      <div>
                        <span className="text-gray-400">State:</span>{' '}
                        <span className="font-semibold">{ORDER_STATES[Number((orderData as any).state ?? 0)]}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Created:</span>{' '}
                        {(orderData as any).createdAt ? new Date(Number((orderData as any).createdAt) * 1000).toLocaleString() : 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-400">Release At:</span>{' '}
                        {(orderData as any).releaseAt && Number((orderData as any).releaseAt) > 0
                          ? new Date(Number((orderData as any).releaseAt) * 1000).toLocaleString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => handleApproveIDRP(contracts.TRADE_ESCROW, orderData ? formatEther((orderData as any).amount) : '0')}
                    disabled={isPending || isConfirming || !orderData}
                    className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Approve IDRP
                  </button>
                  <button
                    onClick={handleFundOrder}
                    disabled={isPending || isConfirming}
                    className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Fund Order
                  </button>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Shipping docs URI"
                    value={shipDocsUri}
                    onChange={(e) => setShipDocsUri(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-600 rounded"
                  />
                  <button
                    onClick={handleMarkShipped}
                    disabled={isPending || isConfirming}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Mark Shipped
                  </button>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Dispute reason"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-600 rounded"
                  />
                  <button
                    onClick={handleRaiseDispute}
                    disabled={isPending || isConfirming}
                    className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-50"
                  >
                    Raise Dispute
                  </button>
                </div>

                <button
                  onClick={handleReleaseOrder}
                  disabled={isPending || isConfirming}
                  className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  Release Funds
                </button>
              </div>
            </div>

            {/* Transaction Status */}
            {(isPending || isConfirming) && (
              <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                {isPending ? 'Confirm in wallet...' : 'Confirming...'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
