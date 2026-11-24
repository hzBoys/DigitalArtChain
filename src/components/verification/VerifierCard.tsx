'use client'

import { useState } from 'react'
import { ArrowUpRight, FileSearch, Fingerprint, LoaderCircle, ShieldCheck, Upload } from 'lucide-react'
import { verifyWork } from '@/src/services/contractService'
import type { ProofRecord } from '@/src/models/ProofRecord'
import { isBytes32Hash } from '@/src/models/ProofRecord'
import { EXPLORER_URL } from '@/src/models/networkConfig'
import { hashMasterFile } from '@/src/utils/hashFile'
import { formatDateTime, shortenAddress, shortenHash } from '@/src/utils/formatters'

export function VerifierCard({ initialHash = '' }: { initialHash?: string }) {
  const [value, setValue] = useState(initialHash)
  const [record, setRecord] = useState<ProofRecord | null>(null)
  const [searched, setSearched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function verify(hash: string) {
    const normalized = hash.trim().toLowerCase()
    setValue(normalized)
    setRecord(null)
    setSearched(false)
    setError(null)
    if (!isBytes32Hash(normalized)) {
      setError('Masukkan hash SHA-256 yang valid: 0x diikuti 64 karakter heksadesimal.')
      return
    }
    setBusy(true)
    try {
      const result = await verifyWork(normalized)
      setRecord(result)
      setSearched(true)
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'Pemeriksaan gagal. Coba kembali.')
    } finally {
      setBusy(false)
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    setRecord(null)
    setSearched(false)
    try {
      const hash = await hashMasterFile(file)
      setValue(hash)
      await verify(hash)
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : 'File tidak dapat dihitung.')
      setBusy(false)
    }
  }

  return (
    <section className="verify-layout" aria-labelledby="verify-title">
      <div className="verify-panel">
        <div className="workflow-panel-kicker"><FileSearch aria-hidden="true" /> VERIFIKASI BUKTI · TANPA DOMPET</div>
        <h2 id="verify-title">Periksa bukti sebuah karya.</h2>
        <p>Unggah file untuk menghitung sidik jarinya di browser, atau tempel hash SHA-256. Pemeriksaan membandingkan fingerprint dengan catatan yang tersedia.</p>
        <label className="workflow-field-label" htmlFor="verification-hash">Hash SHA-256</label>
        <div className="verify-input-row">
          <input id="verification-hash" className="workflow-input" value={value} onChange={(event) => setValue(event.target.value)} placeholder="0x…" autoComplete="off" spellCheck={false} />
          <button className="workflow-button workflow-button-primary" type="button" onClick={() => void verify(value)} disabled={busy}>
            {busy ? <LoaderCircle className="workflow-spinner" aria-hidden="true" /> : <Fingerprint aria-hidden="true" />}
            Periksa
          </button>
        </div>
        <label className="verify-file-button workflow-button workflow-button-outline">
          <Upload aria-hidden="true" /> Hitung dari file lokal
          <input className="sr-only" type="file" aria-label="Pilih file karya untuk menghitung hash dan memverifikasi" onChange={(event) => { void handleFile(event.target.files?.item(0) ?? undefined); event.target.value = '' }} />
        </label>
        <p className="workflow-microcopy"><ShieldCheck aria-hidden="true" /> File tidak pernah dikirim; hanya hash 32-byte yang diperiksa.</p>
        {error && <div className="workflow-notice notice-error" role="alert">{error}</div>}
      </div>

      <div className={`verify-result${record ? ' is-verified' : ''}`} aria-live="polite">
        {!record && !searched && !busy && !error && (
          <div className="verify-empty"><span className="verify-empty-icon"><Fingerprint aria-hidden="true" /></span><strong>Menunggu sidik jari</strong><span>Hasil pemeriksaan akan tampil di sini.</span></div>
        )}
        {busy && <div className="verify-empty"><LoaderCircle className="workflow-spinner" aria-hidden="true" /><strong>Memeriksa bukti…</strong><span>Mencari fingerprint pada catatan yang tersedia.</span></div>}
        {searched && !record && <div className="verify-empty not-found"><span className="verify-empty-icon"><FileSearch aria-hidden="true" /></span><strong>Bukti belum ditemukan</strong><span>Hash ini belum tercatat pada sumber yang sedang digunakan.</span></div>}
        {record && (
          <div className="verification-record">
            <div className="verification-status"><span className="status-pulse" />BUKTI DITEMUKAN</div>
            <h3>{record.title || 'Karya terdaftar'}</h3>
            <dl className="verification-data">
              <div><dt>Sidik jari SHA-256</dt><dd><code>{shortenHash(record.fileHash)}</code></dd></div>
              <div><dt>Pencatat pertama</dt><dd>{shortenAddress(record.creator)}</dd></div>
              <div><dt>Waktu UTC</dt><dd>{formatDateTime(record.timestamp)}</dd></div>
              {record.category && <div><dt>Kategori</dt><dd>{record.category}</dd></div>}
              {record.ipfsCid && <div><dt>Preview publik</dt><dd><a href={`https://gateway.pinata.cloud/ipfs/${record.ipfsCid}`} target="_blank" rel="noreferrer">Buka preview <ArrowUpRight aria-hidden="true" /></a></dd></div>}
              {record.txHash && <div><dt>Transaksi blockchain</dt><dd><a href={`${EXPLORER_URL}/tx/${record.txHash}`} target="_blank" rel="noreferrer">Buka transaksi <ArrowUpRight aria-hidden="true" /></a></dd></div>}
              <div><dt>Tanda tangan pemilik</dt><dd><code>{shortenHash(record.signature)}</code></dd></div>
            </dl>
            <p className="certificate-disclaimer">Bukti ini merangkum fingerprint dan tanda tangan digital; bukan pengganti pendaftaran hak cipta resmi atau keputusan hukum kepemilikan.</p>
          </div>
        )}
      </div>
    </section>
  )
}
