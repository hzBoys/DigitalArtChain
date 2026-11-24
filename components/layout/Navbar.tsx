'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu, Wallet, X } from 'lucide-react'
import { useWallet } from '@/src/controllers/useWallet'
import { METAMASK_DOWNLOAD_URL } from '@/src/models/networkConfig'
import { WalletProfileMenu } from '@/components/layout/WalletProfileMenu'

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/register', label: 'Catat karya' },
  { href: '/verify', label: 'Verifikasi' },
  { href: '/gallery', label: 'Galeri' },
]

export function Navbar() {
  const wallet = useWallet()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const navLinks = links.map((link) => ({ ...link, active: pathname === link.href }))

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" href="/" aria-label="KaryaChain Beranda">
          <span className="brand-mark" aria-hidden="true">K</span>
          <span>KaryaChain<span className="brand-period">.</span></span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {navLinks.map(({ href, label, active }) => <Link className={`nav-link${active ? ' active' : ''}`} href={href} key={href} aria-current={active ? 'page' : undefined}>{label}</Link>)}
          <Link className="nav-link nav-anchor-link" href="/#cara-kerja">Cara kerja</Link>
        </nav>
        <div className="nav-actions">
          {!wallet.isConnected && !wallet.hasMetaMask && !wallet.isConnecting ? (
            <a className="connect-button" href={METAMASK_DOWNLOAD_URL} target="_blank" rel="noreferrer">
              Install MetaMask <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ) : wallet.isConnected ? (
            <WalletProfileMenu wallet={wallet} />
          ) : (
            <button className="connect-button" type="button" onClick={() => void wallet.connectWallet()} disabled={wallet.isConnecting}>
              <Wallet size={15} aria-hidden="true" />
              {wallet.isConnecting ? 'Menghubungkan…' : 'Connect Wallet'}
            </button>
          )}
          <button className="mobile-menu" type="button" aria-label={menuOpen ? 'Tutup navigasi' : 'Buka navigasi'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" className={`mobile-nav${menuOpen ? ' mobile-nav-open' : ''}`} aria-label="Navigasi mobile" hidden={!menuOpen}>
        {navLinks.map(({ href, label, active }) => <Link href={href} key={href} aria-current={active ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{label}</Link>)}
        <Link href="/#cara-kerja" onClick={() => setMenuOpen(false)}>Cara kerja</Link>
      </nav>
      {wallet.error && (
        <div className="wallet-notice" role="status">
          {wallet.error.includes(METAMASK_DOWNLOAD_URL) ? <><span>MetaMask belum terpasang.</span> <a href={METAMASK_DOWNLOAD_URL} target="_blank" rel="noreferrer">Pasang dari situs resmi <ArrowUpRight size={13} aria-hidden="true" /></a></> : wallet.error}
          <button type="button" aria-label="Tutup notifikasi" onClick={wallet.clearError}><X size={15} aria-hidden="true" /></button>
        </div>
      )}
    </header>
  )
}
