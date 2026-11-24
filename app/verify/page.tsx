import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { VerifierCard } from '@/src/components/verification/VerifierCard'

export const metadata: Metadata = {
  title: 'Verifikasi Bukti — KaryaChain',
  description: 'Verifikasi timestamp bukti karya digital dengan fingerprint SHA-256 tanpa mengunggah file master.',
}

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ hash?: string }> }) {
  const { hash } = await searchParams
  const initialHash = hash && /^0x[\da-fA-F]{64}$/.test(hash) ? hash.toLowerCase() : ''
  return (
    <>
      <Navbar />
      <main className="workflow-route">
        <Link className="workflow-back-link" href="/"><ArrowLeft aria-hidden="true" /> Kembali ke Beranda</Link>
        <div className="workflow-page-heading">
          <div>
            <p className="workflow-overline">VERIFIKASI / 03</p>
            <h1>Bukti yang bisa diperiksa siapa saja.</h1>
            <p>Tidak perlu login atau menghubungkan dompet. Masukkan fingerprint dan periksa timestamp secara publik.</p>
          </div>
        </div>
        <VerifierCard initialHash={initialHash} />
      </main>
    </>
  )
}
