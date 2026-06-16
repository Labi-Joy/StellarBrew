interface SuccessResult {
  status: 'success'
  hash: string
  explorerUrl: string
  amount: string
}

interface ErrorResult {
  status: 'error'
  message: string
}

export type TxResult = SuccessResult | ErrorResult

interface Props {
  result: TxResult
  onDismiss: () => void
}

export default function TransactionResult({ result, onDismiss }: Props) {
  if (result.status === 'success') {
    return (
      <div className="rounded-xl border border-brew-success/40 bg-brew-success/10 p-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-brew-success">
            ✅ Tip sent — {result.amount} XLM. Thanks for the caffeine!
          </p>
          <button onClick={onDismiss} className="text-brew-muted hover:text-brew-text">
            ✕
          </button>
        </div>
        <p className="text-xs text-brew-muted break-all">
          <span className="font-mono">{result.hash}</span>
        </p>
        <a
          href={result.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm text-brew-accent hover:underline"
        >
          View on Stellar Expert ↗
        </a>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-brew-error/40 bg-brew-error/10 p-4 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-brew-error">⚠️ Transaction failed</p>
        <button onClick={onDismiss} className="text-brew-muted hover:text-brew-text">
          ✕
        </button>
      </div>
      <p className="text-sm text-brew-text/90 break-words">{result.message}</p>
    </div>
  )
}
