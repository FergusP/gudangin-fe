import { useReadContract } from 'wagmi'
import { contracts } from '../config'
import TradeEscrowABI from '../abi/TradeEscrow.json'
import type { Order } from '../types'

export function useOrder(orderId: string) {
  const enabled = !!orderId && orderId.startsWith('0x')

  const { data, refetch } = useReadContract({
    address: contracts.TRADE_ESCROW as `0x${string}`,
    abi: TradeEscrowABI,
    functionName: 'getOrder',
    args: orderId ? [orderId as `0x${string}`] : undefined,
    query: { enabled },
  })

  return {
    order: data as Order | undefined,
    refetch,
  }
}
