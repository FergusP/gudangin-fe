import { useState, useCallback } from 'react'
import { useAccount, useSignTypedData } from 'wagmi'
import { encodeFunctionData, type Abi } from 'viem'
import {
  getEIP712Domain,
  getNonce,
  relay,
  ForwardRequestTypes,
  type ForwardRequest,
} from '../services/relayer'
import { contracts } from '../config'

export type MetaTxStatus = 'idle' | 'signing' | 'relaying' | 'success' | 'error'

export interface UseMetaTransactionReturn {
  execute: (params: MetaTxParams) => Promise<string | undefined>
  status: MetaTxStatus
  txHash: string | undefined
  error: string | undefined
  reset: () => void
}

export interface MetaTxParams {
  to: `0x${string}`
  abi: Abi
  functionName: string
  args: unknown[]
  gas?: bigint
}

// Default gas limit for meta-transactions
const DEFAULT_GAS = 500000n
// Deadline: 1 hour from now
const getDeadline = () => Math.floor(Date.now() / 1000) + 3600

export function useMetaTransaction(): UseMetaTransactionReturn {
  const { address } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()

  const [status, setStatus] = useState<MetaTxStatus>('idle')
  const [txHash, setTxHash] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()

  const reset = useCallback(() => {
    setStatus('idle')
    setTxHash(undefined)
    setError(undefined)
  }, [])

  const execute = useCallback(
    async (params: MetaTxParams): Promise<string | undefined> => {
      if (!address) {
        setError('Wallet not connected')
        setStatus('error')
        return undefined
      }

      try {
        reset()
        setStatus('signing')

        // Encode the function call
        const data = encodeFunctionData({
          abi: params.abi,
          functionName: params.functionName,
          args: params.args,
        })

        // Get domain and nonce from relayer
        const [domain, nonce] = await Promise.all([
          getEIP712Domain(),
          getNonce(address),
        ])

        const deadline = BigInt(getDeadline())
        const gas = params.gas || DEFAULT_GAS

        // Prepare the forward request message (for signing)
        const message = {
          from: address,
          to: params.to,
          value: 0n,
          gas,
          nonce: BigInt(nonce),
          deadline,
          data,
        }

        // Sign the typed data
        const signature = await signTypedDataAsync({
          domain: {
            name: domain.name,
            version: domain.version,
            chainId: BigInt(domain.chainId),
            verifyingContract: domain.verifyingContract as `0x${string}`,
          },
          types: ForwardRequestTypes,
          primaryType: 'ForwardRequest',
          message,
        })

        setStatus('relaying')

        // Submit to relayer
        const request: ForwardRequest = {
          from: address,
          to: params.to,
          value: '0',
          gas: gas.toString(),
          deadline: deadline.toString(),
          data,
          signature,
        }

        const result = await relay(request)

        if (result.success && result.txHash) {
          setTxHash(result.txHash)
          setStatus('success')
          return result.txHash
        } else {
          setError(result.error || 'Relay failed')
          setStatus('error')
          return undefined
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        setStatus('error')
        return undefined
      }
    },
    [address, signTypedDataAsync, reset]
  )

  return {
    execute,
    status,
    txHash,
    error,
    reset,
  }
}

// Convenience hook for TradeEscrow meta-transactions
export function useTradeEscrowMetaTx() {
  const metaTx = useMetaTransaction()

  const createOrder = useCallback(
    async (
      orderId: `0x${string}`,
      buyer: `0x${string}`,
      vault: `0x${string}`,
      tokenId: bigint,
      amount: bigint,
      lockDuration: bigint,
      abi: Abi
    ) => {
      return metaTx.execute({
        to: contracts.TRADE_ESCROW as `0x${string}`,
        abi,
        functionName: 'createOrder',
        args: [orderId, buyer, vault, tokenId, amount, lockDuration],
        gas: 300000n,
      })
    },
    [metaTx]
  )

  const fund = useCallback(
    async (orderId: `0x${string}`, abi: Abi) => {
      return metaTx.execute({
        to: contracts.TRADE_ESCROW as `0x${string}`,
        abi,
        functionName: 'fund',
        args: [orderId],
        gas: 200000n,
      })
    },
    [metaTx]
  )

  const release = useCallback(
    async (orderId: `0x${string}`, abi: Abi) => {
      return metaTx.execute({
        to: contracts.TRADE_ESCROW as `0x${string}`,
        abi,
        functionName: 'release',
        args: [orderId],
        gas: 300000n,
      })
    },
    [metaTx]
  )

  return {
    ...metaTx,
    createOrder,
    fund,
    release,
  }
}

// Convenience hook for VaultFactory meta-transactions
export function useVaultFactoryMetaTx() {
  const metaTx = useMetaTransaction()

  const createVault = useCallback(
    async (
      tokenId: bigint,
      investorProfitShareBps: bigint,
      abi: Abi
    ) => {
      return metaTx.execute({
        to: contracts.VAULT_FACTORY as `0x${string}`,
        abi,
        functionName: 'createVault',
        args: [tokenId, investorProfitShareBps],
        gas: 800000n,
      })
    },
    [metaTx]
  )

  return {
    ...metaTx,
    createVault,
  }
}
