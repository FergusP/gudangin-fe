import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Escrow Frontend',
  projectId: '8eade44de5b8ac1e92ec03fcb4fc2474',
  chains: [sepolia],
})

// Contract addresses (Sepolia)
export const contracts = {
  IDRP_TOKEN: '0xc1fAB272a555DB0d420E44f61e0F1ddB440E9B88',
  GOODS_TOKEN: '0x0d2df3127A1dF32D899C210B1209a611739A4e3A',
  TRADE_ESCROW: '0x3a0edaFB40FA11E2f5316e6D64217AFf685a56ac',
  VAULT_FACTORY: '0x174E729378577e0Ba20ed97B47983A494dF8F77c',
  GOODS_ROUTER: '0x5fA2Cd4e60d0c486Dc952D68DB58706faeD22F88',
} as const
