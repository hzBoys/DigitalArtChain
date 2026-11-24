import type { ProofRecord } from './ProofRecord'

const records = new Map<string, ProofRecord>()

export function getMockProof(fileHash: string): ProofRecord | null {
  return records.get(fileHash.toLowerCase()) ?? null
}

export function addMockProof(record: ProofRecord): void {
  records.set(record.fileHash.toLowerCase(), record)
}

export function getMockGallery(): ProofRecord[] {
  return [...records.values()]
    .filter((record) => record.ipfsCid.length > 0)
    .sort((left, right) => right.timestamp - left.timestamp)
}
