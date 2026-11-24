import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUpRight, Fingerprint, ShieldCheck, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

const principles = [
  { number: '01', title: 'Privat secara default', detail: 'File asli tak pernah meninggalkan perangkat Anda.', expanded: 'SHA-256 dihitung langsung di browser. Blockchain hanya menerima fingerprint 32-byte—bukan gambar, audio, video, ataupun dokumen master.', icon: ShieldCheck },
  { number: '02', title: 'Bukti yang dapat diverifikasi', detail: 'Sidik jari digital dapat dicatat di blockchain publik.', expanded: 'Siapa pun dapat menghitung ulang hash dari file yang diberikan dan membandingkannya dengan catatan timestamp tanpa membuat akun atau menghubungkan wallet.', icon: Fingerprint },
  { number: '03', title: 'Karya tetap milik Anda', detail: 'Tanpa perantara, tanpa token, tanpa klaim berlebihan.', expanded: 'Catatan kriptografis membantu menunjukkan keberadaan dan waktu sebuah karya. Ini bukan pengganti pendaftaran hak cipta resmi atau keputusan hukum kepemilikan.', icon: Sparkles },
]

export default function HomePage() {
  return (
    <main>
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
          <div className="hero-footnote"><Fingerprint size={14} aria-hidden="true" /> SHA-256 dihitung langsung di browser</div>
        </div>
        <aside className="proof-card" aria-label="Karya digital Ashina oleh @exhozt_">
          <div className="proof-artwork">
            <Image className="proof-artwork-image" src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ashina-%E1%B4%98%CA%80%C9%AA%C9%B4%E1%B4%9B%EA%9C%B1%20-%20%C9%B4%EA%9C%B0%E1%B4%9B%20-%20%E1%B4%8D%E1%B4%8F%CA%80%E1%B4%87%CA%9F%C9%AA%C9%B4%E1%B4%8B%20%E1%B4%8F%C9%B4%20%E1%B4%8D%CA%8F%20%CA%99%C9%AA%E1%B4%8F%40exhozt%C2%A0%40exhozt_swipe%20for%20full._lofiart_animeaesthetic_p-xM7fFpUIDDbVTJiLt9pvlSPpc3MEi9.jpg" alt="Ashina — ilustrasi digital pagoda di bawah langit senja biru dan pohon sakura ungu, karya @exhozt_" fill priority sizes="(max-width: 640px) 90vw, 400px" />
            <div className="proof-artwork-tags" aria-hidden="true"><span>KARYA DIGITAL</span><span>SHA-256</span></div>
            <span className="proof-artwork-index" aria-hidden="true">KC / 01</span>
          </div>
          <div className="proof-card-info">
            <div className="proof-card-title-wrap"><span className="proof-card-label">IDENTITAS KARYA</span><strong>Ashina</strong><span className="proof-card-artist">Karya oleh @exhozt_</span></div>
            <span className="proof-card-icon"><Fingerprint size={20} strokeWidth={1.5} aria-hidden="true" /></span>
          </div>
          <div className="proof-card-footer"><span>SIDIK JARI KRIPTOGRAFIS</span><span>256-BIT</span></div>
        </aside>
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

      <section className="closing-section" id="mulai"><div><span className="closing-mark">KC / 01</span><h2>Karya Anda.<br />Waktu Anda.</h2></div><Link className="button-primary" href="/register">Siap untuk memulai <ArrowRight size={17} aria-hidden="true" /></Link></section>
      <footer className="site-footer"><Link className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true">K</span><span>KaryaChain<span className="brand-period">.</span></span></Link><span>Proof of existence untuk karya digital.</span><span>BUKTI DIGITAL · SHA-256</span></footer>
    </main>
  )
}
