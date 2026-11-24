import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUpRight, Fingerprint, ShieldCheck, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { ArtworkShowcase } from '@/src/components/ArtworkShowcase'

const principles = [
  { number: '01', title: 'Privat secara default', detail: 'File asli tak pernah meninggalkan perangkat Anda.', expanded: 'Fingerprint unik dibuat di perangkat Anda. Blockchain hanya menerima sidik jari 32-byte—bukan gambar, audio, video, ataupun dokumen master.', icon: ShieldCheck },
  { number: '02', title: 'Bukti yang dapat diverifikasi', detail: 'Sidik jari digital dapat dicatat di blockchain publik.', expanded: 'Siapa pun dapat menghitung ulang hash dari file yang diberikan dan membandingkannya dengan catatan timestamp tanpa membuat akun atau menghubungkan wallet.', icon: Fingerprint },
  { number: '03', title: 'Karya tetap milik Anda', detail: 'Tanpa perantara, tanpa token, tanpa klaim berlebihan.', expanded: 'Catatan kriptografis membantu menunjukkan keberadaan dan waktu sebuah karya. Ini bukan pengganti pendaftaran hak cipta resmi atau keputusan hukum kepemilikan.', icon: Sparkles },
]

export default function HomePage() {
  return (
    <main className="home-page">
      <Navbar />
      <section className="hero-section" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <div className="eyebrow"><span className="eyebrow-line" /> BUKTI DIGITAL, TANPA PERANTARA</div>
          <h1>Waktu membuktikan<br />siapa <span>yang lebih dulu.</span></h1>
          <p className="hero-copy">Buat bukti digital untuk karya Anda dengan fingerprint SHA-256. File master tetap privat di perangkat, sementara identitas karyanya dapat diverifikasi.</p>
          <div className="hero-actions">
            <Link className="button-primary" href="/register">Mulai mencatat <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link className="button-secondary" href="#cara-kerja">Pelajari cara kerja <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
        <ArtworkShowcase />
        <a className="scroll-cue" href="#cara-kerja" aria-label="Gulir ke cara kerja"><ArrowDown size={15} /> SCROLL TO EXPLORE</a>
      </section>

      <section className="principles-section" id="tentang">
        <div className="section-kicker">BUKTI, BUKAN JANJI <span>01 — 03</span></div>
        <div className="principles-grid">
          {principles.map(({ number, title, detail, expanded, icon: Icon }) => (
            <details className="principle-card" key={number}>
              <summary className="principle-summary">
                <div className="principle-top"><span>{number}</span><Icon size={20} strokeWidth={1.6} aria-hidden="true" /></div>
                <h2>{title}</h2><p>{detail}</p>
                <span className="principle-toggle-label"><span className="principle-toggle-open">Buka penjelasan</span><span className="principle-toggle-close">Tutup penjelasan</span><ArrowDown aria-hidden="true" /></span>
              </summary>
              <p className="principle-expanded-copy">{expanded}</p>
              <Link className="principle-learn-link" href={number === '02' ? '/verify' : '/register'}>{number === '02' ? 'Coba verifikasi' : 'Lihat cara kerja'} <ArrowRight aria-hidden="true" /></Link>
            </details>
          ))}
        </div>
      </section>

      <section className="process-section" id="cara-kerja">
        <div className="process-heading"><div><div className="section-kicker">SESEDERHANA ITU <span>02 — 03</span></div><h2>Bukti publik.<br /><span>Proses yang sederhana.</span></h2></div><p>File master tetap di perangkat. Fingerprint ditandatangani dompet dan dapat dicatat pada blockchain saat kontrak registri siap.</p></div>
        <div className="process-steps">
          <div className="process-step"><span className="step-index">01</span><h3>Pilih karya</h3><p>Pilih file dari perangkat Anda. File tidak diunggah ke mana pun.</p></div>
          <div className="process-step"><span className="step-index">02</span><h3>Buat sidik jari</h3><p>Browser menghitung SHA-256 secara lokal—unik untuk setiap file.</p></div>
          <div className="process-step"><span className="step-index">03</span><h3>Catat di blockchain</h3><p>Tanda tangani fingerprint dan simpan timestamp saat kontrak registri diaktifkan.</p></div>
        </div>
      </section>

      <section className="closing-section" id="mulai"><div><span className="closing-mark">DAC / 01</span><h2>Karya Anda.<br />Waktu Anda.</h2></div><Link className="button-primary" href="/register">Siap untuk memulai <ArrowRight size={17} aria-hidden="true" /></Link></section>
      <footer className="site-footer"><Link className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true">DAC</span><span>DigitalArtChain<span className="brand-period">.</span></span></Link><span>Proof of existence untuk karya digital.</span></footer>
    </main>
  )
}
