interface TransactionStatusProps {
  isPending: boolean
  isConfirming: boolean
}

export function TransactionStatus({ isPending, isConfirming }: TransactionStatusProps) {
  if (!isPending && !isConfirming) return null

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
      {isPending ? 'Confirm in wallet...' : 'Confirming...'}
    </div>
  )
}
