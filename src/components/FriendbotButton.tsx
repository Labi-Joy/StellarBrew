import { useState } from 'react'
import { fundWithFriendbot } from '../lib/stellar'

interface Props {
  address: string
  onFunded: () => void
}

export default function FriendbotButton({ address, onFunded }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function go() {
    setBusy(true)
    setErr(null)
    try {
      await fundWithFriendbot(address)
      onFunded()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Friendbot funding failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-xl border border-brew-line bg-brew-panel/50 p-4 space-y-2">
      <p className="text-sm">
        Your wallet isn't funded on testnet yet. Hit Friendbot to grab{' '}
        <span className="text-brew-accent font-semibold">10,000 free testnet XLM</span>.
      </p>
      <button onClick={go} disabled={busy} className="btn-primary text-sm">
        {busy ? 'Funding…' : 'Fund with Friendbot'}
      </button>
      {err && <p className="text-xs text-brew-error">{err}</p>}
    </div>
  )
}
