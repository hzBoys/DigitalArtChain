'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, Copy, Download, Printer, ShieldCheck } from 'lucide-react'
import type { ProofRecord } from '@/src/models/ProofRecord'
import { TARGET_CHAIN_ID } from '@/src/models/networkConfig'
import { getAddressExplorerUrl, getTransactionExplorerUrl } from '@/src/services/contractService'
import { formatDateTime, shortenAddress, shortenHash } from '@/src/utils/formatters'

export function ReceiptModal({ record, onClose }: { record: ProofRecord; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  async function copyHash() {
    await navigator.clipboard.writeText(record.fileHash)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function downloadJson() {
    const certificate = {
      schema: 'karyachain-proof-v1',
      network: record.isMock ? 'local-session' : `eip155:${TARGET_CHAIN_ID}`,
      fileHash: record.fileHash,
      creator: record.creator,
      timestamp: record.timestamp,
      timestampIso: new Date(record.timestamp * 1000).toISOString(),
      signature: record.signature,
      title: record.title,
      category: record.category,
      ipfsCid: record.ipfsCid || null,
      transactionHash: record.txHash,
      isMock: record.isMock,
      disclaimer: 'Bukti digital ini bukan pengganti pendaftaran hak cipta resmi atau keputusan hukum kepemilikan.',
    }
    const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = `karyachain-${record.fileHash.slice(2, 10)}.json`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(href), 1000)
  }

  return (
    <div className="certificate-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="certificate-sheet" role="dialog" aria-modal="true" aria-labelledby="certificate-title">
        <div className="certificate-topline"><span>KARYACHAIN / SERTIFIKAT</span><span>{record.isMock ? 'SIDIK JARI' : 'BLOCKCHAIN'}</span></div>
        <div className="certificate-emblem"><ShieldCheck aria-hidden="true" /></div>
        <p className="workflow-overline">BUKTI DIGITAL</p>
        <h2 id="certificate-title">Sertifikat Bukti Digital</h2>
        <p className="certificate-intro">Sertifikat merangkum sidik jari kriptografi dan waktu pencatatan. File master tidak disertakan.</p>
        {record.ipfsCid ? (
          <div className="workflow-notice notice-neutral" role="status">Preview ber-watermark berhasil dibagikan. Karya ini sekarang tersedia di Galeri Publik.</div>
        ) : (
          <div className="workflow-notice notice-neutral" role="status">Bukti berhasil dicatat secara privat dan tidak ditampilkan di Galeri Publik.</div>
        )}
        {record.isMock && <div className="workflow-notice notice-neutral" role="status">Fingerprint dan tanda tangan wallet tersimpan dalam ringkasan bukti ini.</div>}
        <dl className="certificate-data">
          <div><dt>SHA-256 / bytes32</dt><dd><code>{record.fileHash}</code><button className="workflow-icon-button" type="button" onClick={copyHash} aria-label="Salin sidik jari"><Copy aria-hidden="true" /></button></dd></div>
          <div><dt>Pencatat pertama</dt><dd><span>{shortenAddress(record.creator)}</span>{!record.isMock && <a href={getAddressExplorerUrl(record.creator)} target="_blank" rel="noreferrer" aria-label="Buka alamat wallet di block explorer"><ArrowUpRight aria-hidden="true" /></a>}</dd></div>
          <div><dt>Waktu pencatatan</dt><dd>{formatDateTime(record.timestamp)}</dd></div>
          <div><dt>Tanda tangan</dt><dd><code>{shortenHash(record.signature)}</code></dd></div>
          <div><dt>Transaksi</dt><dd>{record.txHash ? <><code>{shortenHash(record.txHash)}</code><a href={getTransactionExplorerUrl(record.txHash)} target="_blank" rel="noreferrer" aria-label="Buka transaksi di block explorer"><ArrowUpRight aria-hidden="true" /></a></> : <span className="muted-value">Belum tersedia</span>}</dd></div>
          {record.ipfsCid && <div><dt>Preview publik · IPFS</dt><dd><code>{record.ipfsCid}</code></dd></div>}
        </dl>
        <p className="certificate-disclaimer">Ringkasan ini menunjukkan fingerprint, tanda tangan, dan waktu digital. Bukan keputusan hukum atau sertifikat resmi DJKI.</p>
        <div className="certificate-actions">
          <button className="workflow-button workflow-button-primary" type="button" onClick={downloadJson}><Download aria-hidden="true" /> Unduh JSON</button>
          {record.ipfsCid && <Link className="workflow-button workflow-button-outline" href="/gallery">Lihat di Galeri <ArrowUpRight aria-hidden="true" /></Link>}
          <button className="workflow-button workflow-button-outline" type="button" onClick={() => window.print()}><Printer aria-hidden="true" /> Simpan PDF</button>
          <button className="workflow-button workflow-button-text" type="button" onClick={onClose}>Tutup</button>
        </div>
        <span className="sr-only" role="status" aria-live="polite">{copied ? 'Sidik jari disalin.' : ''}</span>
        {copied && <p className="copy-confirmation"><Check aria-hidden="true" /> Sidik jari disalin</p>}
      </section>
    </div>
  )
}
