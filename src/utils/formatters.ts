export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(timestamp * 1000)) + ' UTC'
}

export function shortenAddress(address: string): string {
  return address.length > 16 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address
}

export function shortenHash(hash: string): string {
  return hash.length > 24 ? `${hash.slice(0, 12)}…${hash.slice(-10)}` : hash
}
