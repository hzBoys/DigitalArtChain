'use client'

import Link from 'next/link'
import { ArrowUpRight, Menu, Wallet } from 'lucide-react'
import { useWallet } from '@/src/controllers/useWallet'
import { METAMASK_DOWNLOAD_URL } from '@/src/models/networkConfig'

function compactAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function Navbar() {
  const wallet = useWallet()

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" href="/" aria-label="KaryaChain Beranda">
          <span className="brand-mark" aria-hidden="true">K</span>
          <span>KaryaChain<span className="brand-period">.</span></span>
          <span className="testnet-tag">TESTNET</span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          <Link className="nav-link active" href="/">Beranda</Link>
          <a className="nav-link" href="#cara-kerja">Cara kerja</a>
          <a className="nav-link" href="#tentang">Tentang</a>
        </nav>
        <div className="nav-actions">
          <span className={`network-pill ${wallet.isConnected && wallet.isCorrectNetwork ? 'network-ready' : ''}`}>
            <span className="network-dot" /> Arbitrum Sepolia
          </span>
          {!wallet.hasMetaMask && !wallet.isConnecting ? (
            <a className="connect-button" href={METAMASK_DOWNLOAD_URL} target="_blank" rel="noreferrer">
              Install MetaMask <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ) : (
            <button className="connect-button" type="button" onClick={wallet.isConnected && !wallet.isCorrectNetwork ? wallet.switchToArbitrumSepolia : wallet.connectWallet} disabled={wallet.isConnecting}>
              <Wallet size={15} aria-hidden="true" />
              {wallet.isConnecting ? 'Menghubungkan…' : wallet.isConnected ? wallet.isCorrectNetwork ? compactAddress(wallet.address!) : 'Ganti jaringan' : 'Connect MetaMask'}
            </button>
          )}
          <button className="mobile-menu" type="button" aria-label="Buka navigasi" onClick={() => document.getElementById('mobile-navigation')?.classList.toggle('mobile-nav-open')}>
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" className="mobile-nav" aria-label="Navigasi mobile">
        <Link href="/">Beranda</Link><a href="#cara-kerja">Cara kerja</a><a href="#tentang">Tentang</a>
      </nav>
      {wallet.error && (
        <div className="wallet-notice" role="status">
          {wallet.error.includes(METAMASK_DOWNLOAD_URL) ? <><span>MetaMask belum terpasang.</span> <a href={METAMASK_DOWNLOAD_URL} target="_blank" rel="noreferrer">Pasang dari situs resmi <ArrowUpRight size={13} aria-hidden="true" /></a></> : wallet.error}
          <button type="button" aria-label="Tutup notifikasi" onClick={() => wallet.disconnectWallet()}>×</button>
        </div>
      )}
    </header>
  )
}
