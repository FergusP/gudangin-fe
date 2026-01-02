import { useReadContract } from 'wagmi'
import { contracts } from '../config'
import VaultFactoryABI from '../abi/VaultFactory.json'

export function useVaults() {
  const { data: vaults, refetch, isRefetching } = useReadContract({
    address: contracts.VAULT_FACTORY as `0x${string}`,
    abi: VaultFactoryABI,
    functionName: 'getAllVaults',
  })

  return {
    vaults: vaults as `0x${string}`[] | undefined,
    refetch,
    isRefetching,
  }
}
