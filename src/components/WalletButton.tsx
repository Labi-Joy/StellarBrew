import { shortenAddress } from '../lib/stellar'
import type { WalletState } from '../hooks/useWallet'

interface Props {
  wallet: WalletState
  onConnect: () => void
  onDisconnect: () => void
}

export default function WalletButton({ wallet, onConnect, onDisconnect }: Props) {
  const { address, isConnecting, isFreighterInstalled } = wallet

  if (!isFreighterInstalled) {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noreferrer"
        className="btn-ghost text-sm"
      >
        Install Freighter ↗
      </a>
    )
  }

  if (!address) {
    return (
      <button onClick={onConnect} disabled={isConnecting} className="btn-primary text-sm">
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-brew-line bg-brew-panel/70 px-3 py-2 text-xs font-mono">
        <span className="h-2 w-2 rounded-full bg-brew-success" />
        {shortenAddress(address)}
      </span>
      <button onClick={onDisconnect} className="btn-ghost text-sm">
        Disconnect
      </button>
    </div>
  )
}
