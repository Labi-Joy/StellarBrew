import {
  Asset,
  BASE_FEE,
  Horizon,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk'
import {
  signTransaction,
} from '@stellar/freighter-api'

export const HORIZON_URL = 'https://horizon-testnet.stellar.org'
export const NETWORK_PASSPHRASE = Networks.TESTNET
export const STELLAR_EXPERT_TX = 'https://stellar.expert/explorer/testnet/tx'
export const FRIENDBOT_URL = 'https://friendbot.stellar.org'

export const server = new Horizon.Server(HORIZON_URL)

export type BalanceResult =
  | { funded: true; xlm: string }
  | { funded: false; xlm: '0' }

export async function fetchBalance(publicKey: string): Promise<BalanceResult> {
  try {
    const account = await server.loadAccount(publicKey)
    const native = account.balances.find((b) => b.asset_type === 'native')
    return { funded: true, xlm: native ? native.balance : '0' }
  } catch (err: unknown) {
    if (isNotFound(err)) return { funded: false, xlm: '0' }
    throw err
  }
}

export async function fundWithFriendbot(publicKey: string): Promise<void> {
  const res = await fetch(`${FRIENDBOT_URL}/?addr=${encodeURIComponent(publicKey)}`)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Friendbot funding failed (${res.status}): ${body.slice(0, 200)}`)
  }
}

export interface SendTipArgs {
  from: string
  to: string
  amountXLM: string
  memo?: string
}

export interface SendTipResult {
  hash: string
  explorerUrl: string
}

export async function sendTip({ from, to, amountXLM, memo }: SendTipArgs): Promise<SendTipResult> {
  const account = await server.loadAccount(from)

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    Operation.payment({
      destination: to,
      asset: Asset.native(),
      amount: amountXLM,
    }),
  )

  if (memo && memo.trim().length > 0) {
    builder.addMemo(Memo.text(memo.slice(0, 28)))
  }

  const tx = builder.setTimeout(120).build()

  const signed = await signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: from,
  })

  if (signed.error) {
    throw new Error(typeof signed.error === 'string' ? signed.error : 'Signing failed')
  }

  const signedTx = TransactionBuilder.fromXDR(signed.signedTxXdr, NETWORK_PASSPHRASE)
  const result = await server.submitTransaction(signedTx)

  return {
    hash: result.hash,
    explorerUrl: `${STELLAR_EXPERT_TX}/${result.hash}`,
  }
}

export function isValidStellarAddress(addr: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(addr)
}

export function shortenAddress(addr: string, head = 6, tail = 6): string {
  if (!addr) return ''
  if (addr.length <= head + tail + 3) return addr
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`
}

export function formatXLM(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString(undefined, { maximumFractionDigits: 7 })
}

function isNotFound(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const e = err as { response?: { status?: number }; name?: string }
  return e.response?.status === 404 || e.name === 'NotFoundError'
}
