import { NextResponse } from 'next/server'
import { getBytes, verifyMessage } from 'ethers'
import { isBytes32Hash } from '@/src/models/ProofRecord'

export const runtime = 'nodejs'

const MAX_PREVIEW_BYTES = 1_000_000
const RATE_WINDOW_MS = 60_000
const MAX_UPLOADS_PER_WINDOW = 5
const uploadAttempts = new Map<string, { count: number; resetAt: number }>()

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function getWebpDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  const chunk = new TextDecoder().decode(bytes.slice(12, 16))
  if (chunk === 'VP8X' && bytes.length >= 30) {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16)
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16)
    return { width, height }
  }
  if (chunk === 'VP8L' && bytes.length >= 25 && bytes[20] === 0x2f) {
    const width = 1 + bytes[21] + ((bytes[22] & 0x3f) << 8)
    const height = 1 + ((bytes[22] & 0xc0) >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10)
    return { width, height }
  }
  if (chunk === 'VP8 ' && bytes.length >= 30 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
    const width = (bytes[26] | (bytes[27] << 8)) & 0x3fff
    const height = (bytes[28] | (bytes[29] << 8)) & 0x3fff
    return { width, height }
  }
  return null
}

export async function POST(request: Request) {
  const secret = process.env.PINATA_JWT
  if (!secret) return jsonError('Galeri IPFS belum dikonfigurasi. Hubungi administrator aplikasi.', 503)

  const form = await request.formData().catch(() => null)
  if (!form) return jsonError('Form unggahan tidak valid.', 400)

  const preview = form.get('preview')
  const fileHash = String(form.get('fileHash') ?? '').toLowerCase()
  const creator = String(form.get('creator') ?? '')
  const signature = String(form.get('signature') ?? '')

  if (!(preview instanceof File)) return jsonError('Preview ber-watermark diperlukan.', 400)
  if (!isBytes32Hash(fileHash)) return jsonError('Hash SHA-256 tidak valid.', 400)
  if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) return jsonError('Tanda tangan wallet tidak valid.', 400)
  if (preview.type !== 'image/webp' || preview.size < 16 || preview.size > MAX_PREVIEW_BYTES) {
    return jsonError('Hanya preview WebP ber-watermark hingga 1 MB yang dapat diunggah.', 413)
  }

  const bytes = new Uint8Array(await preview.arrayBuffer())
  const header = new TextDecoder().decode(bytes.slice(0, 12))
  if (header.slice(0, 4) !== 'RIFF' || header.slice(8, 12) !== 'WEBP') {
    return jsonError('File preview bukan WebP yang valid.', 415)
  }
  const dimensions = getWebpDimensions(bytes)
  if (!dimensions || dimensions.width < 1 || dimensions.height < 1) {
    return jsonError('Dimensi preview WebP tidak dapat diverifikasi.', 415)
  }
  if (dimensions.width > 800 || dimensions.height > 800) {
    return jsonError('Dimensi preview maksimum 800 × 800 piksel.', 413)
  }

  let recoveredAddress: string
  try {
    recoveredAddress = verifyMessage(getBytes(fileHash), signature)
  } catch {
    return jsonError('Tanda tangan tidak dapat diverifikasi.', 401)
  }
  if (recoveredAddress.toLowerCase() !== creator.toLowerCase()) {
    return jsonError('Alamat pembuat tidak cocok dengan tanda tangan wallet.', 401)
  }

  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rateKey = `${forwardedFor}:${recoveredAddress.toLowerCase()}`
  const now = Date.now()
  const attempt = uploadAttempts.get(rateKey)
  if (attempt && attempt.resetAt > now && attempt.count >= MAX_UPLOADS_PER_WINDOW) {
    return jsonError('Batas unggahan sementara tercapai. Coba kembali sebentar lagi.', 429)
  }
  uploadAttempts.set(rateKey, attempt && attempt.resetAt > now
    ? { count: attempt.count + 1, resetAt: attempt.resetAt }
    : { count: 1, resetAt: now + RATE_WINDOW_MS })
  if (uploadAttempts.size > 2_000) {
    for (const [key, value] of uploadAttempts) if (value.resetAt <= now) uploadAttempts.delete(key)
  }

  const pinataForm = new FormData()
  pinataForm.set('file', preview, 'karyachain-watermarked-preview.webp')
  pinataForm.set('pinataMetadata', JSON.stringify({ name: `KaryaChain preview ${fileHash.slice(2, 10)}` }))
  pinataForm.set('pinataOptions', JSON.stringify({ cidVersion: 1 }))

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}` },
      body: pinataForm,
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    })
    if (!response.ok) return jsonError('Layanan IPFS menolak preview. Pastikan konfigurasi Pinata aktif, lalu coba kembali.', 502)
    const result = await response.json() as { IpfsHash?: string }
    if (!result.IpfsHash || !/^[a-zA-Z0-9]{20,100}$/.test(result.IpfsHash)) return jsonError('Layanan IPFS mengembalikan CID yang tidak valid.', 502)
    return NextResponse.json({ ipfsCid: result.IpfsHash }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return jsonError('Tidak dapat menghubungi IPFS saat ini. Coba kembali.', 502)
  }
}
