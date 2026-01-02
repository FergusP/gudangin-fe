interface VaultListProps {
  vaults: `0x${string}`[] | undefined
  selectedVault: `0x${string}` | null
  onSelectVault: (vault: `0x${string}` | null) => void
  onRefresh: () => void
  isRefetching: boolean
  children?: React.ReactNode
}

export function VaultList({
  vaults,
  selectedVault,
  onSelectVault,
  onRefresh,
  isRefetching,
  children,
}: VaultListProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Vaults</h2>
        <button
          onClick={onRefresh}
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
              onClick={() => onSelectVault(selectedVault === vaultAddr ? null : vaultAddr)}
              className={`w-full text-left p-3 flex justify-between items-center ${
                selectedVault === vaultAddr ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <span className="font-mono text-sm">
                Vault {i}: {vaultAddr.slice(0, 10)}...{vaultAddr.slice(-8)}
              </span>
              <span className="text-gray-400">{selectedVault === vaultAddr ? '▲' : '▼'}</span>
            </button>
            {selectedVault === vaultAddr && children}
          </div>
        ))}
        {(!vaults || vaults.length === 0) && <p className="text-gray-400">No vaults found</p>}
      </div>
    </div>
  )
}
