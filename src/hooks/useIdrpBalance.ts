import { useReadContract } from 'wagmi'
import { contracts } from '../config'
import IDRPABI from '../abi/IDRP.json'

export function useIdrpBalance(address: `0x${string}` | undefined) {
  const { data } = useReadContract({
    address: contracts.IDRP_TOKEN as `0x${string}`,
    abi: IDRPABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  return data as bigint | undefined
}
