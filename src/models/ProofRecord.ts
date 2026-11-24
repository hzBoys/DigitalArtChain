export const WORK_CATEGORIES = ['Ilustrasi', 'Fotografi', 'Audio & Musik', 'Video'] as const

export type WorkCategory = (typeof WORK_CATEGORIES)[number]

export interface ProofRecord {
  fileHash: string
  creator: string
  timestamp: number
  signature: string
  title: string
  category: string
  ipfsCid: string
  txHash: string | null
  isMock: boolean
}

export type RegistrationUiState =
  | 'IDLE'
  | 'HASHING'
  | 'PRE_CHECKING'
  | 'DUPLICATE_DETECTED'
  | 'READY_TO_SIGN'
  | 'UPLOADING_PREVIEW'
  | 'AWAITING_SIGNATURE'
  | 'AWAITING_TX_APPROVAL'
  | 'MINING'
  | 'SUCCESS'
  | 'ERROR'

export interface RegistrationInput {
  fileHash: string
  file: File
  title: string
  category: WorkCategory
  publishToGallery: boolean
}

export function isBytes32Hash(value: string): boolean {
  return /^0x[a-f0-9]{64}$/.test(value)
}
