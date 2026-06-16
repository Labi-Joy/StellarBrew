import { useCallback, useEffect, useState } from 'react'
import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  WatchWalletChanges,
} from '@stellar/freighter-api'
import { NETWORK_PASSPHRASE } from '../lib/stellar'

const STORAGE_KEY = 'stellarbrew:address'

export interface WalletState {
  address: string | null
  network: string | null
  networkPassphrase: string | null
  isWrongNetwork: boolean
  isFreighterInstalled: boolean
  isConnecting: boolean
  error: string | null
}

const INITIAL: WalletState = {
  address: null,
  network: null,
  networkPassphrase: null,
  isWrongNetwork: false,
  isFreighterInstalled: false,
  isConnecting: false,
  error: null,
}

export function useWallet() {
  const [state, setState] = useState<WalletState>(INITIAL)

  const refreshNetwork = useCallback(async () => {
    const net = await getNetwork()
    if (net.error) return
    setState((s) => ({
      ...s,
      network: net.network,
      networkPassphrase: net.networkPassphrase,
      isWrongNetwork: net.networkPassphrase !== NETWORK_PASSPHRASE,
    }))
  }, [])

  // On mount: detect Freighter + restore prior session if user already approved access.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const installed = await isConnected()
      if (cancelled) return
      const isInstalled = !!installed.isConnected

      setState((s) => ({ ...s, isFreighterInstalled: isInstalled }))
      if (!isInstalled) return

      const allowed = await isAllowed()
      if (cancelled) return

      if (allowed.isAllowed) {
        const addrRes = await getAddress()
        if (cancelled) return
        if (!addrRes.error && addrRes.address) {
          localStorage.setItem(STORAGE_KEY, addrRes.address)
          setState((s) => ({ ...s, address: addrRes.address }))
        }
      } else {
        // user revoked or never granted — clear any stale local copy
        localStorage.removeItem(STORAGE_KEY)
      }

      await refreshNetwork()
    })()
    return () => {
      cancelled = true
    }
  }, [refreshNetwork])

  // React to wallet/network changes from inside Freighter.
  useEffect(() => {
    const watcher = new WatchWalletChanges(2000)
    watcher.watch(({ address, network, networkPassphrase }) => {
      setState((s) => ({
        ...s,
        address: address || null,
        network: network || null,
        networkPassphrase: networkPassphrase || null,
        isWrongNetwork: !!networkPassphrase && networkPassphrase !== NETWORK_PASSPHRASE,
      }))
      if (address) {
        localStorage.setItem(STORAGE_KEY, address)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    })
    return () => watcher.stop()
  }, [])

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isConnecting: true, error: null }))
    try {
      const installed = await isConnected()
      if (!installed.isConnected) {
        throw new Error('Freighter is not installed. Get it at freighter.app')
      }

      const access = await requestAccess()
      if (access.error || !access.address) {
        throw new Error(access.error || 'No address returned from Freighter')
      }

      localStorage.setItem(STORAGE_KEY, access.address)
      setState((s) => ({ ...s, address: access.address, isConnecting: false }))
      await refreshNetwork()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to connect'
      setState((s) => ({ ...s, isConnecting: false, error: msg }))
    }
  }, [refreshNetwork])

  const disconnect = useCallback(() => {
    // Freighter has no programmatic revoke API. We clear the dApp's local
    // session so the UI returns to the disconnected state.
    localStorage.removeItem(STORAGE_KEY)
    setState((s) => ({
      ...s,
      address: null,
      error: null,
    }))
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return { ...state, connect, disconnect, refreshNetwork, clearError }
}
