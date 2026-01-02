import { useReadContract } from 'wagmi'
import VaultABI from '../abi/Vault.json'
import type { VaultState } from '../types'

export function useVaultDetails(vaultAddress: `0x${string}` | null) {
  const enabled = !!vaultAddress

  const { data: state } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'state',
    query: { enabled },
  })

  const { data: trader } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'trader',
    query: { enabled },
  })

  const { data: investor } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'investor',
    query: { enabled },
  })

  const { data: admin } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'admin',
    query: { enabled },
  })

  const { data: totalDeposited } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'totalDeposited',
    query: { enabled },
  })

  const { data: totalSpent } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'totalSpent',
    query: { enabled },
  })

  const { data: totalSaleProceeds } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'totalSaleProceeds',
    query: { enabled },
  })

  const { data: availableFunds } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'getAvailableFunds',
    query: { enabled },
  })

  const { data: maxDeposit } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'getMaxDeposit',
    query: { enabled },
  })

  const { data: collateralTokenId } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'collateralTokenId',
    query: { enabled },
  })

  const { data: collateralValue } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'collateralValue',
    query: { enabled },
  })

  const { data: nextReleaseId } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'nextReleaseId',
    query: { enabled },
  })

  const { data: investorProfitShareBps } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'investorProfitShareBps',
    query: { enabled },
  })

  const { data: pendingOrderCount } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'pendingOrderCount',
    query: { enabled },
  })

  return {
    state: state as VaultState | undefined,
    trader: trader as `0x${string}` | undefined,
    investor: investor as `0x${string}` | undefined,
    admin: admin as `0x${string}` | undefined,
    totalDeposited: totalDeposited as bigint | undefined,
    totalSpent: totalSpent as bigint | undefined,
    totalSaleProceeds: totalSaleProceeds as bigint | undefined,
    availableFunds: availableFunds as bigint | undefined,
    maxDeposit: maxDeposit as bigint | undefined,
    collateralTokenId: collateralTokenId as bigint | undefined,
    collateralValue: collateralValue as bigint | undefined,
    nextReleaseId: nextReleaseId as bigint | undefined,
    investorProfitShareBps: investorProfitShareBps as bigint | undefined,
    pendingOrderCount: pendingOrderCount as bigint | undefined,
  }
}
