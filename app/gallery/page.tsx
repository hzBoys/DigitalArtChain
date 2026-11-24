import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { GalleryGrid } from '@/src/components/gallery/GalleryGrid'

export const metadata: Metadata = {
  title: 'Galeri Karya — KaryaChain',
  description: 'Jelajahi preview karya yang kreator pilih untuk dibagikan. File master tetap privat.',
}

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main className="workflow-route">
        <Link className="workflow-back-link" href="/"><ArrowLeft aria-hidden="true" /> Kembali ke Beranda</Link>
        <div className="workflow-page-heading">
          <div>
            <p className="workflow-overline">GALERI PUBLIK / 04</p>
            <h1>Karya yang dipilih untuk dibagikan.</h1>
            <p>Preview ber-watermark di sini dibagikan secara sukarela. Setiap karya menyimpan fingerprint yang dapat diverifikasi.</p>
          </div>
          <Link className="workflow-button workflow-button-primary" href="/register">Daftarkan karya</Link>
        </div>
        <GalleryGrid />
      </main>
    </>
  )
}
