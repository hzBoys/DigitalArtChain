import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { RegistrationWorkspace } from '@/src/components/registration/RegistrationWorkspace'

export const metadata: Metadata = {
  title: 'Daftarkan Karya — DigitalArtChain',
  description: 'Hitung fingerprint SHA-256 secara lokal dan siapkan bukti waktu untuk karya digital Anda.'
}

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="workflow-route">
        <Link className="workflow-back-link" href="/"><ArrowLeft aria-hidden="true" /> Kembali ke Beranda</Link>
        <RegistrationWorkspace />
      </main>
    </>
  )
}
