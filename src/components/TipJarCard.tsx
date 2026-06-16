import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { shortenAddress } from '../lib/stellar'

interface Props {
  address: string
  ownerName: string
}

export default function TipJarCard({ address, ownerName }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard might be blocked; ignore silently
    }
  }

  return (
    <div className="panel p-6 flex flex-col items-center text-center gap-4">
      <div>
        <p className="text-sm text-brew-muted">Tip jar for</p>
        <h2 className="text-2xl font-semibold">{ownerName}</h2>
      </div>

      <div className="rounded-2xl bg-white p-3 shadow-glow">
        <QRCodeSVG value={address} size={168} level="M" />
      </div>

      <button
        onClick={copy}
        className="font-mono text-xs text-brew-muted hover:text-brew-accent transition"
        title="Click to copy full address"
      >
        {shortenAddress(address, 8, 8)} {copied ? '✓ copied' : '· tap to copy'}
      </button>
    </div>
  )
}
