import { ConnectButton } from '@rainbow-me/rainbowkit'
import { formatEther } from 'viem'

interface HeaderProps {
  idrpBalance: bigint | undefined
}

export function Header({ idrpBalance }: HeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Escrow Dashboard</h1>
        <ConnectButton />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Wallet Info</h2>
        <p className="text-gray-400">
          IDRP Balance: {idrpBalance ? formatEther(idrpBalance) : '0'} IDRP
        </p>
      </div>
    </>
  )
}
