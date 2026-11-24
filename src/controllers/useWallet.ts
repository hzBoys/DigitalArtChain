'use client'

import { useCallback, useEffect, useState } from 'react'
import { ARBITRUM_SEPOLIA, METAMASK_DOWNLOAD_URL, TARGET_CHAIN_ID } from '@/src/models/networkConfig'

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>
  on: (event: string, listener: (...args: unknown[]) => void) => void
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

export interface UseWalletReturn {
  address: string | null
  chainId: number | null
  isConnected: boolean
  isCorrectNetwork: boolean
  isConnecting: boolean
  hasMetaMask: boolean
  error: string | null
  connectWallet: () => Promise<void>
  switchToArbitrumSepolia: () => Promise<void>
  disconnectWallet: () => void
  clearError: () => void
}

type WalletStateUpdate = Partial<{ address: string | null; chainId: number | null }>

const WALLET_STATE_EVENT = 'karyachain:wallet-state'

function broadcastWalletState(update: WalletStateUpdate) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<WalletStateUpdate>(WALLET_STATE_EVENT, { detail: update }))
}

function getProvider() {
  return typeof window !== 'undefined' ? window.ethereum : undefined
}

function friendlyError(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 4001) {
    return 'Permintaan dibatalkan. Anda dapat mencoba kembali kapan saja.'
  }
  return error instanceof Error ? error.message : 'Terjadi kendala saat menghubungkan dompet.'
}

export function useWallet(): UseWalletReturn {
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMetaMask, setHasMetaMask] = useState(false)

  useEffect(() => {
    const handleWalletState = (event: Event) => {
      const update = (event as CustomEvent<WalletStateUpdate>).detail
      if ('address' in update) setAddress(update.address ?? null)
      if ('chainId' in update) setChainId(update.chainId ?? null)
    }
    window.addEventListener(WALLET_STATE_EVENT, handleWalletState)

    const provider = getProvider()
    setHasMetaMask(Boolean(provider))
    if (!provider) return () => window.removeEventListener(WALLET_STATE_EVENT, handleWalletState)

    let active = true
    void Promise.all([
      provider.request({ method: 'eth_accounts' }),
      provider.request({ method: 'eth_chainId' }),
    ]).then(([accounts, currentChain]) => {
      if (!active) return
      const accountList = accounts as string[]
      setAddress(accountList[0] ?? null)
      setChainId(Number.parseInt(String(currentChain), 16))
    }).catch(() => undefined)

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[]
      setAddress(accountList[0] ?? null)
      setError(null)
    }
    const handleChainChanged = (nextChain: unknown) => {
      setChainId(Number.parseInt(String(nextChain), 16))
      setError(null)
    }

    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('chainChanged', handleChainChanged)
    return () => {
      active = false
      window.removeEventListener(WALLET_STATE_EVENT, handleWalletState)
      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  const switchToArbitrumSepolia = useCallback(async () => {
    const provider = getProvider()
    if (!provider) {
      setError(`MetaMask belum terpasang. ${METAMASK_DOWNLOAD_URL}`)
      return
    }
    setError(null)
    try {
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: ARBITRUM_SEPOLIA.chainIdHex }] })
    } catch (switchError) {
      const code = typeof switchError === 'object' && switchError !== null && 'code' in switchError ? switchError.code : undefined
      if (code !== 4902) throw switchError
      await provider.request({ method: 'wallet_addEthereumChain', params: [ARBITRUM_SEPOLIA] })
    }
    setChainId(TARGET_CHAIN_ID)
    broadcastWalletState({ chainId: TARGET_CHAIN_ID })
  }, [])

  const connectWallet = useCallback(async () => {
    const provider = getProvider()
    if (!provider) {
      setHasMetaMask(false)
      setError(`MetaMask belum terpasang. ${METAMASK_DOWNLOAD_URL}`)
      return
    }
    setIsConnecting(true)
    setError(null)
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[]
      setAddress(accounts[0] ?? null)
      const currentChain = await provider.request({ method: 'eth_chainId' })
      const nextChainId = Number.parseInt(String(currentChain), 16)
      setChainId(nextChainId)
      broadcastWalletState({ address: accounts[0] ?? null, chainId: nextChainId })
    } catch (connectError) {
      setError(friendlyError(connectError))
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setError(null)
    broadcastWalletState({ address: null })
  }, [])
  const clearError = useCallback(() => setError(null), [])

  return {
    address,
    chainId,
    isConnected: Boolean(address),
    isCorrectNetwork: chainId === TARGET_CHAIN_ID,
    isConnecting,
    hasMetaMask,
    error,
    connectWallet,
    switchToArbitrumSepolia,
    disconnectWallet,
    clearError,
  }
}
