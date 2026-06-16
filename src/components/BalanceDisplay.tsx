import { formatXLM } from '../lib/stellar'

interface Props {
  balance: string | null
  funded: boolean
  loading: boolean
  onRefresh: () => void
}

export default function BalanceDisplay({ balance, funded, loading, onRefresh }: Props) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-brew-line bg-brew-panel/50 px-4 py-3">
      <div>
        <p className="text-xs text-brew-muted">Your balance</p>
        <p className="text-lg font-semibold">
          {loading ? (
            <span className="text-brew-muted">Loading…</span>
          ) : !funded ? (
            <span className="text-brew-error">Unfunded</span>
          ) : (
            <>
              {formatXLM(balance ?? '0')}{' '}
              <span className="text-sm font-medium text-brew-muted">XLM</span>
            </>
          )}
        </p>
      </div>
      <button onClick={onRefresh} className="btn-ghost text-xs">
        Refresh
      </button>
    </div>
  )
}
