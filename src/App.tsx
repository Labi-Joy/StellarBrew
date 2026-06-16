import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header'
import TipJarCard from './components/TipJarCard'
import TipAmountPicker from './components/TipAmountPicker'
import BalanceDisplay from './components/BalanceDisplay'
import TransactionResult, { type TxResult } from './components/TransactionResult'
import FriendbotButton from './components/FriendbotButton'
import { useWallet } from './hooks/useWallet'
import {
  fetchBalance,
  isValidStellarAddress,
  sendTip,
} from './lib/stellar'

const TIP_JAR_ADDRESS = import.meta.env.VITE_TIP_JAR_ADDRESS
const TIP_JAR_NAME = import.meta.env.VITE_TIP_JAR_NAME ?? 'the sleepy dev'

export default function App() {
  const wallet = useWallet()
  const [amount, setAmount] = useState('5')
  const [memo, setMemo] = useState('')
  const [sending, setSending] = useState(false)
  const [txResult, setTxResult] = useState<TxResult | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [funded, setFunded] = useState<boolean>(true)
  const [balanceLoading, setBalanceLoading] = useState(false)

  const refreshBalance = useCallback(async () => {
    if (!wallet.address) {
      setBalance(null)
      setFunded(true)
      return
    }
    setBalanceLoading(true)
    try {
      const r = await fetchBalance(wallet.address)
      setBalance(r.xlm)
      setFunded(r.funded)
    } catch {
      setBalance(null)
    } finally {
      setBalanceLoading(false)
    }
  }, [wallet.address])

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  const onSend = useCallback(async () => {
    setTxResult(null)
    if (!wallet.address) return
    if (!isValidStellarAddress(TIP_JAR_ADDRESS)) {
      setTxResult({
        status: 'error',
        message: 'Tip jar address is not configured. Set VITE_TIP_JAR_ADDRESS in your .env file.',
      })
      return
    }
    if (wallet.address === TIP_JAR_ADDRESS) {
      setTxResult({
        status: 'error',
        message: "You can't tip yourself — connect a different wallet to test.",
      })
      return
    }
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      setTxResult({ status: 'error', message: 'Enter a positive amount of XLM.' })
      return
    }

    setSending(true)
    try {
      const r = await sendTip({
        from: wallet.address,
        to: TIP_JAR_ADDRESS,
        amountXLM: amount,
        memo: memo || 'StellarBrew tip ☕',
      })
      setTxResult({
        status: 'success',
        hash: r.hash,
        explorerUrl: r.explorerUrl,
        amount,
      })
      refreshBalance()
    } catch (e: unknown) {
      setTxResult({
        status: 'error',
        message: parseStellarError(e),
      })
    } finally {
      setSending(false)
    }
  }, [wallet.address, amount, memo, refreshBalance])

  const addressMissing = !isValidStellarAddress(TIP_JAR_ADDRESS)

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16">
      <Header wallet={wallet} onConnect={wallet.connect} onDisconnect={wallet.disconnect} />

      {addressMissing && (
        <div className="panel p-4 mb-6 text-sm border-brew-error/40 bg-brew-error/10">
          <strong>Setup needed:</strong> set <code>VITE_TIP_JAR_ADDRESS</code> in your <code>.env</code> file to a valid testnet address.
        </div>
      )}

      {wallet.error && (
        <div className="panel p-4 mb-6 text-sm border-brew-error/40 bg-brew-error/10 flex items-center justify-between gap-3">
          <span>{wallet.error}</span>
          <button onClick={wallet.clearError} className="text-brew-muted hover:text-brew-text">✕</button>
        </div>
      )}

      <main className="grid gap-6 md:grid-cols-2">
        <TipJarCard address={TIP_JAR_ADDRESS ?? ''} ownerName={TIP_JAR_NAME} />

        <section className="panel p-6 space-y-5">
          <div>
            <h2 className="text-xl font-semibold">Send a tip</h2>
            <p className="text-sm text-brew-muted">
              All on Stellar <span className="font-mono text-brew-accent">testnet</span> — no real money involved.
            </p>
          </div>

          {!wallet.address ? (
            <div className="rounded-xl border border-brew-line bg-brew-bg/60 p-4 text-sm text-brew-muted">
              Connect your Freighter wallet to send a tip.
            </div>
          ) : wallet.isWrongNetwork ? (
            <div className="rounded-xl border border-brew-error/40 bg-brew-error/10 p-4 text-sm">
              Your Freighter is on <span className="font-mono">{wallet.network ?? 'an unknown network'}</span>.
              Switch it to <span className="font-mono text-brew-accent">TESTNET</span> to send a tip.
            </div>
          ) : !funded ? (
            <FriendbotButton address={wallet.address} onFunded={refreshBalance} />
          ) : (
            <>
              <TipAmountPicker value={amount} onChange={setAmount} disabled={sending} />

              <div>
                <p className="text-sm text-brew-muted mb-1">Memo (optional, max 28 chars)</p>
                <input
                  className="input"
                  maxLength={28}
                  placeholder="StellarBrew tip ☕"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  disabled={sending}
                />
              </div>

              <button
                onClick={onSend}
                disabled={sending || !amount || Number(amount) <= 0}
                className="btn-primary w-full"
              >
                {sending ? 'Sending…' : `Send ${amount || '0'} XLM`}
              </button>

              <BalanceDisplay
                balance={balance}
                funded={funded}
                loading={balanceLoading}
                onRefresh={refreshBalance}
              />
            </>
          )}

          {txResult && (
            <TransactionResult result={txResult} onDismiss={() => setTxResult(null)} />
          )}
        </section>
      </main>

      <footer className="mt-12 text-center text-xs text-brew-muted">
        Built on Stellar testnet · Freighter · stellar-sdk
      </footer>
    </div>
  )
}

function parseStellarError(err: unknown): string {
  if (err instanceof Error) {
    const anyErr = err as Error & { response?: { data?: unknown } }
    const data = anyErr.response?.data as
      | { extras?: { result_codes?: { operations?: string[]; transaction?: string } } }
      | undefined
    const opCodes = data?.extras?.result_codes?.operations
    const txCode = data?.extras?.result_codes?.transaction
    if (opCodes?.length) return `Operation failed: ${opCodes.join(', ')}`
    if (txCode) return `Transaction failed: ${txCode}`
    return err.message
  }
  return 'Unknown error'
}
