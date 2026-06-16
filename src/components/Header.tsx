import WalletButton from './WalletButton'
import type { WalletState } from '../hooks/useWallet'

interface Props {
  wallet: WalletState
  onConnect: () => void
  onDisconnect: () => void
}

export default function Header({ wallet, onConnect, onDisconnect }: Props) {
  return (
    <header className="flex items-center justify-between py-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brew-panel border border-brew-line text-xl">
          ☕
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">StellarBrew</h1>
          <p className="text-xs text-brew-muted leading-tight">
            Buy me a coffee so I don't fall asleep
          </p>
        </div>
      </div>
      <WalletButton wallet={wallet} onConnect={onConnect} onDisconnect={onDisconnect} />
    </header>
  )
}
