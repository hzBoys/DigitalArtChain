'use client'

import { useState, type FocusEvent } from 'react'
import { Check, ChevronDown, Copy, Wallet } from 'lucide-react'
import type { UseWalletReturn } from '@/src/controllers/useWallet'

function compactAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function WalletProfileMenu({ wallet }: { wallet: UseWalletReturn }) {
  const [copied, setCopied] = useState(false)
  const address = wallet.address ?? ''

  if (!address) return null

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function closeWhenFocusLeaves(event: FocusEvent<HTMLDetailsElement>) {
    const nextTarget = event.relatedTarget
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      event.currentTarget.open = false
    }
  }

  return (
    <details className="wallet-profile" onBlur={closeWhenFocusLeaves}>
      <summary className="connect-button wallet-profile-trigger" aria-label={`Profil wallet ${compactAddress(address)}`}>
        <Wallet size={15} aria-hidden="true" />
        <span>{compactAddress(address)}</span>
        <ChevronDown className="wallet-profile-chevron" size={14} aria-hidden="true" />
      </summary>
      <div className="wallet-profile-popover" aria-label="Informasi wallet">
        <div className="wallet-profile-heading">
          <span className="wallet-profile-avatar"><Wallet size={18} aria-hidden="true" /></span>
          <div><strong>Wallet terhubung</strong><span>Profil dompet aktif</span></div>
        </div>
        <div className="wallet-profile-data">
          <div className="wallet-profile-field">
            <span>Alamat</span>
            <div className="wallet-profile-address-row"><code>{address}</code><button type="button" className="wallet-copy-button" onClick={() => void copyAddress()} aria-label="Salin alamat wallet" title="Salin alamat wallet">{copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}</button></div>
          </div>
          <div className="wallet-profile-field"><span>Jaringan</span><strong>{wallet.chainId ? `Chain ID ${wallet.chainId}` : 'Membaca jaringan…'}</strong></div>
        </div>
        <div className={`wallet-profile-status${wallet.isCorrectNetwork ? ' is-ready' : ' is-warning'}`} role="status">
          <span aria-hidden="true" />
          {wallet.isCorrectNetwork ? 'Jaringan siap untuk pencatatan' : 'Pilih jaringan yang didukung untuk mendaftar'}
        </div>
        {!wallet.isCorrectNetwork && <button className="wallet-profile-switch" type="button" onClick={() => void wallet.switchToArbitrumSepolia()}>Ganti jaringan</button>}
        <span className="sr-only" role="status" aria-live="polite">{copied ? 'Alamat wallet disalin.' : ''}</span>
      </div>
    </details>
  )
}
