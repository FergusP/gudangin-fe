import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useVaults, useVaultDetails, useOrder, useIdrpBalance } from './hooks'
import {
  Header,
  CreateVault,
  VaultList,
  VaultDetails,
  VaultActions,
  RequestRelease,
  ManageRelease,
  CreateOrder,
  OrderDetails,
  OrderActions,
} from './components'

function App() {
  const { address, isConnected } = useAccount()
  const [selectedVault, setSelectedVault] = useState<`0x${string}` | null>(null)
  const [viewOrderId, setViewOrderId] = useState('')

  // Data hooks
  const { vaults, refetch: refetchVaults, isRefetching } = useVaults()
  const vault = useVaultDetails(selectedVault)
  const { order, refetch: refetchOrder } = useOrder(viewOrderId)
  const idrpBalance = useIdrpBalance(address)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Header idrpBalance={idrpBalance} />

        {!isConnected ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Connect your wallet to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Create Vault */}
            <CreateVault />

            {/* Vaults List with expandable details */}
            <VaultList
              vaults={vaults}
              selectedVault={selectedVault}
              onSelectVault={setSelectedVault}
              onRefresh={refetchVaults}
              isRefetching={isRefetching}
            >
              {selectedVault && (
                <div className="bg-gray-800 border-t border-gray-600 p-4">
                  {/* Vault Details */}
                  <VaultDetails
                    address={selectedVault}
                    state={vault.state}
                    trader={vault.trader}
                    investor={vault.investor}
                    admin={vault.admin}
                    totalDeposited={vault.totalDeposited}
                    totalSpent={vault.totalSpent}
                    totalSaleProceeds={vault.totalSaleProceeds}
                    availableFunds={vault.availableFunds}
                    maxDeposit={vault.maxDeposit}
                    collateralTokenId={vault.collateralTokenId}
                    collateralValue={vault.collateralValue}
                    investorProfitShareBps={vault.investorProfitShareBps}
                    nextReleaseId={vault.nextReleaseId}
                    pendingOrderCount={vault.pendingOrderCount}
                  />

                  {/* Vault Actions */}
                  <VaultActions vaultAddress={selectedVault} />

                  {/* Fund Release Section */}
                  <div className="border-t border-gray-600 pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-3">Fund Releases</h3>
                    <RequestRelease vaultAddress={selectedVault} />
                    <ManageRelease vaultAddress={selectedVault} />
                  </div>
                </div>
              )}
            </VaultList>

            {/* Trade Escrow Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Trade Escrow</h2>

              {/* Create Order (requires selected vault) */}
              {selectedVault && <CreateOrder vaultAddress={selectedVault} />}

              {/* View/Manage Order */}
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

                {order && (
                  <>
                    <OrderDetails order={order} />
                    <OrderActions
                      orderId={viewOrderId as `0x${string}`}
                      order={order}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
