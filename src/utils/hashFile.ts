export const MAX_MASTER_FILE_BYTES = 50 * 1024 * 1024

export async function hashMasterFile(file: File): Promise<string> {
  if (file.size > MAX_MASTER_FILE_BYTES) {
    throw new Error('Ukuran file maksimal 50 MB agar dapat diproses dengan aman di browser.')
  }

  if (!globalThis.crypto?.subtle) {
    throw new Error('Browser ini tidak mendukung Web Crypto. Buka situs melalui HTTPS atau localhost.')
  }

  const digest = await globalThis.crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `0x${hex}`
}
