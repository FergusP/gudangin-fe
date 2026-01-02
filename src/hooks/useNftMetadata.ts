import { useReadContract } from 'wagmi'
import { contracts } from '../config'
import GoodsTokenABI from '../abi/GoodsToken.json'

export function useNftMetadata(tokenId: string) {
  const enabled = !!tokenId

  const { data: vendor } = useReadContract({
    address: contracts.GOODS_TOKEN as `0x${string}`,
    abi: GoodsTokenABI,
    functionName: 'getVendor',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled },
  })

  const { data: value } = useReadContract({
    address: contracts.GOODS_TOKEN as `0x${string}`,
    abi: GoodsTokenABI,
    functionName: 'getValue',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled },
  })

  return {
    vendor: vendor as string | undefined,
    value: value as bigint | undefined,
  }
}
