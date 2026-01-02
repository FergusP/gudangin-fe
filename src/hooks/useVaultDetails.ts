import { useReadContract } from 'wagmi'
import VaultABI from '../abi/Vault.json'

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

  const { data: totalDeposited } = useReadContract({
    address: vaultAddress ?? undefined,
    abi: VaultABI,
    functionName: 'totalDeposited',
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

  return {
    state: state as number | undefined,
    trader: trader as string | undefined,
    investor: investor as string | undefined,
    totalDeposited: totalDeposited as bigint | undefined,
    availableFunds: availableFunds as bigint | undefined,
    maxDeposit: maxDeposit as bigint | undefined,
    collateralTokenId: collateralTokenId as bigint | undefined,
    collateralValue: collateralValue as bigint | undefined,
    nextReleaseId: nextReleaseId as bigint | undefined,
    investorProfitShareBps: investorProfitShareBps as bigint | undefined,
  }
}
