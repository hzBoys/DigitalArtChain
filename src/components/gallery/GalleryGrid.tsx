'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, ImagePlus, LoaderCircle, RefreshCw, Search } from 'lucide-react'
import { useIpfsGallery } from '@/src/controllers/useIpfsGallery'
import { WORK_CATEGORIES } from '@/src/models/ProofRecord'
import { ArtworkCard } from '@/src/components/gallery/ArtworkCard'
import { isMockContract } from '@/src/services/contractService'

export function GalleryGrid() {
  const { records, error, isLoading, refresh } = useIpfsGallery()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Semua')
  const filtered = useMemo(() => records.filter((record) => {
    const matchesCategory = category === 'Semua' || record.category === category
    const searchText = `${record.title} ${record.category} ${record.fileHash} ${record.creator}`.toLowerCase()
    return matchesCategory && searchText.includes(query.trim().toLowerCase())
  }), [category, query, records])

  return (
    <section className="gallery-workspace" aria-label="Galeri bukti karya publik">
      <div className="gallery-toolbar">
        <label className="gallery-search"><Search aria-hidden="true" /><span className="sr-only">Cari karya</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, hash, dompet…" /></label>
        <button className="workflow-button workflow-button-outline gallery-refresh" type="button" onClick={() => void refresh()} disabled={isLoading}><RefreshCw className={isLoading ? 'workflow-spinner' : ''} aria-hidden="true" /> Segarkan</button>
      </div>
      <div className="gallery-filters" role="group" aria-label="Filter kategori">
        {['Semua', ...WORK_CATEGORIES].map((item) => <button className={`gallery-filter${category === item ? ' is-active' : ''}`} type="button" key={item} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}
      </div>
      {isMockContract() && <div className="workflow-notice notice-warning gallery-notice"><AlertCircle aria-hidden="true" /><span>Mode simulasi: karya hanya terlihat selama tab ini aktif. Untuk galeri on-chain, deploy kontrak lalu atur alamatnya di NEXT_PUBLIC_CONTRACT_ADDRESS dan set <code>NEXT_PUBLIC_USE_MOCK_CONTRACT=false</code>.</span></div>}
      {error && <div className="workflow-notice notice-error" role="alert"><AlertCircle aria-hidden="true" /><span>{error} Pastikan RPC dan alamat kontrak testnet tersedia.</span></div>}
      {isLoading && <div className="gallery-state"><LoaderCircle className="workflow-spinner" aria-hidden="true" /><strong>Memuat catatan publik…</strong></div>}
      {!isLoading && !error && filtered.length > 0 && <div className="artwork-grid">{filtered.map((record) => <ArtworkCard key={`${record.fileHash}-${record.txHash ?? 'local'}`} record={record} />)}</div>}
      {!isLoading && !error && records.length === 0 && (
        <div className="gallery-empty"><div className="gallery-empty-icon"><ImagePlus aria-hidden="true" /></div><p className="workflow-overline">GALERI BELUM MEMILIKI KARYA</p><h2>Jaga karya Anda, lalu pilih untuk membagikannya.</h2><p>Setiap kreator menentukan sendiri apakah ingin menerbitkan preview ber-watermark. Tanpa persetujuan, galeri tidak menampilkan apa pun.</p><Link className="workflow-button workflow-button-primary" href="/register">Daftarkan karya <ArrowRight aria-hidden="true" /></Link></div>
      )}
      {!isLoading && !error && records.length > 0 && filtered.length === 0 && <div className="gallery-state"><strong>Tidak ada karya yang cocok.</strong><button className="workflow-text-button" type="button" onClick={() => { setQuery(''); setCategory('Semua') }}>Hapus filter</button></div>}
    </section>
  )
}
