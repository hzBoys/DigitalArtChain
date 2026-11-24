'use client'

import Link from 'next/link'
import { ArrowUpRight, Fingerprint } from 'lucide-react'
import type { ProofRecord } from '@/src/models/ProofRecord'
import { IPFS_GATEWAY } from '@/src/models/networkConfig'
import { shortenAddress, shortenHash } from '@/src/utils/formatters'

export function ArtworkCard({ record }: { record: ProofRecord }) {
  return (
    <article className="artwork-card">
      <Link href={`/verify?hash=${encodeURIComponent(record.fileHash)}`} className="artwork-preview" aria-label={`Lihat bukti karya ${record.title || 'tanpa judul'}`}>
        {record.ipfsCid ? <img src={`${IPFS_GATEWAY.replace(/\/$/, '')}/${record.ipfsCid}`} alt={`Preview ber-watermark: ${record.title || record.category}`} loading="lazy" /> : <div className="artwork-placeholder" aria-hidden="true"><Fingerprint /><span>{record.category || 'KARYA'}</span></div>}
        <span className="artwork-open"><ArrowUpRight aria-hidden="true" /></span>
      </Link>
      <div className="artwork-details">
        <div className="artwork-heading"><h3>{record.title || 'Karya tanpa judul'}</h3><span>{record.category || 'Tanpa kategori'}</span></div>
        <div className="artwork-meta"><code>{shortenHash(record.fileHash)}</code><span>{shortenAddress(record.creator)}</span></div>
        <Link className="artwork-verify-link" href={`/verify?hash=${encodeURIComponent(record.fileHash)}`}>Periksa bukti <ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </article>
  )
}
