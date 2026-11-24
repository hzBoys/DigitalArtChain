import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUpRight, Fingerprint, ShieldCheck, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_CONTRACT !== 'false'

const principles = [
  { number: '01', title: 'Privat secara default', detail: 'File asli tak pernah meninggalkan perangkat Anda.', expanded: 'SHA-256 dihitung langsung di browser. Blockchain hanya menerima fingerprint 32-byte—bukan gambar, audio, video, ataupun dokumen master.', icon: ShieldCheck },
  { number: '02', title: 'Bukti yang dapat diverifikasi', detail: 'Sidik jari digital dicatat di blockchain publik.', expanded: 'Siapa pun dapat menghitung ulang hash dari file yang diberikan dan membandingkannya dengan catatan timestamp tanpa membuat akun atau menghubungkan wallet.', icon: Fingerprint },
  { number: '03', title: 'Karya tetap milik Anda', detail: 'Tanpa perantara, tanpa token, tanpa klaim berlebihan.', expanded: 'Pendaftaran memberi bukti keberadaan dan waktu pada testnet; ini bukan pengganti pendaftaran hak cipta resmi atau keputusan hukum kepemilikan.', icon: Sparkles },
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
          <p className="hero-copy">Catat sidik jari kriptografi karya digital Anda di Arbitrum. File asli tetap di perangkat, bukti tercatat untuk siapa pun.</p>
          <div className="hero-actions">
            <Link className="button-primary" href="/register">Mulai mencatat <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link className="button-secondary" href="#cara-kerja">Pelajari cara kerja <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="hero-footnote"><span className="status-pulse" />{isMockMode ? 'Mode demo · tanpa transaksi blockchain' : 'Target: Arbitrum Sepolia Testnet'}</div>
        </div>
        <aside className="proof-card" aria-label="Contoh sidik jari digital">
          <div className="proof-card-top"><span>FINGERPRINT / SHA-256</span><span className="proof-live"><i /> {isMockMode ? 'DEMO' : 'TESTNET'}</span></div>
          <div className="hash-visual" aria-hidden="true">
            <div className="hash-orbit orbit-one" /><div className="hash-orbit orbit-two" />
            <div className="hash-center"><Fingerprint size={37} strokeWidth={1.3} /></div>
            <span className="orbit-node node-one" /><span className="orbit-node node-two" /><span className="orbit-node node-three" />
          </div>
          <div className="proof-hash-label">CONTOH FINGERPRINT · BUKAN CATATAN LIVE</div>
          <div className="proof-hash">0x7f83…a1c9</div>
          <div className="proof-card-footer"><span><span className="tiny-check">✓</span> SHA-256</span><span>256 BITS</span></div>
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
        <div className="process-heading"><div><div className="section-kicker">SESEDERHANA ITU <span>02 — 03</span></div><h2>Bukti publik.<br /><span>Proses yang sederhana.</span></h2></div><p>Tidak ada unggahan file master. Hanya kriptografi dan blockchain publik—dengan testnet sebagai lingkungan uji.</p></div>
        <div className="process-steps">
          <div className="process-step"><span className="step-index">01</span><h3>Pilih karya</h3><p>Pilih file dari perangkat Anda. File tidak diunggah ke mana pun.</p></div>
          <div className="process-step"><span className="step-index">02</span><h3>Buat sidik jari</h3><p>Browser menghitung SHA-256 secara lokal—unik untuk setiap file.</p></div>
          <div className="process-step"><span className="step-index">03</span><h3>Catat di chain</h3><p>Tanda tangani fingerprint dan catat timestamp di Arbitrum Sepolia.</p></div>
        </div>
      </section>

      <section className="closing-section" id="mulai"><div><span className="closing-mark">KC / 01</span><h2>Karya Anda.<br />Waktu Anda.</h2></div><Link className="button-primary" href="/register">Siap untuk memulai <ArrowRight size={17} aria-hidden="true" /></Link></section>
      <footer className="site-footer"><Link className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true">K</span><span>KaryaChain<span className="brand-period">.</span></span></Link><span>Proof of existence untuk karya digital.</span><span>ARBITRUM SEPOLIA · TESTNET</span></footer>
    </main>
  )
}
