import { BrowserProvider, Contract, ContractFactory, Interface, JsonRpcProvider, getBytes } from 'ethers'
import artifact from '@/src/models/ProofOfExistenceArtifact.json'
import { ARBITRUM_SEPOLIA, EXPLORER_URL } from '@/src/models/networkConfig'
import { PROOF_OF_EXISTENCE_ABI } from '@/src/models/proofOfExistenceAbi'
import { addMockProof, getMockGallery, getMockProof } from '@/src/models/mockRegistry'
import { getSessionDeployment, setSessionDeployment } from '@/src/models/sessionDeployment'
import type { ProofRecord, RegistrationInput, RegistrationUiState } from '@/src/models/ProofRecord'
import { createWatermarkedPreview } from '@/src/utils/createWatermarkedPreview'

export class ProofServiceError extends Error {
  constructor(message: string, readonly code?: string, readonly existingRecord?: ProofRecord | null) {
    super(message)
    this.name = 'ProofServiceError'
  }
}

export function isMockContract(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_CONTRACT !== 'false'
}

export function getConfiguredContractAddress(): string | null {
  const configured = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  if (configured && /^0x[a-fA-F0-9]{40}$/.test(configured) && !/^0x0{40}$/i.test(configured)) return configured
  return getSessionDeployment()?.address ?? null
}

function getPublicProvider(): JsonRpcProvider {
  return new JsonRpcProvider(
    process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC ?? ARBITRUM_SEPOLIA.rpcUrls[0],
    ARBITRUM_SEPOLIA.chainId,
  )
}

function getWalletProvider(): BrowserProvider {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new ProofServiceError('MetaMask belum terpasang. Pasang ekstensi resmi untuk melanjutkan.', 'NO_WALLET')
  }
  const provider = new BrowserProvider(window.ethereum as unknown as ConstructorParameters<typeof BrowserProvider>[0])
  return provider
}

function getReadContract(provider: JsonRpcProvider): Contract {
  const address = getConfiguredContractAddress()
  if (!address) {
    throw new ProofServiceError('Alamat kontrak belum tersedia. Deploy kontrak dari halaman Daftar Karya terlebih dahulu.', 'NO_CONTRACT')
  }
  return new Contract(address, PROOF_OF_EXISTENCE_ABI, provider)
}

function toProofRecord(
  fileHash: string,
  result: readonly [string, bigint, string, string, string, string],
): ProofRecord | null {
  const [creator, timestamp, signature, title, category, ipfsCid] = result
  if (Number(timestamp) === 0) return null
  return {
    fileHash,
    creator,
    timestamp: Number(timestamp),
    signature,
    title,
    category,
    ipfsCid,
    txHash: null,
    isMock: false,
  }
}

export async function verifyWork(fileHash: string): Promise<ProofRecord | null> {
  if (isMockContract()) return getMockProof(fileHash)
  const contract = getReadContract(getPublicProvider())
  const result = await contract.getFunction('verifyWork')(fileHash) as readonly [string, bigint, string, string, string, string]
  return toProofRecord(fileHash, result)
}

async function uploadGalleryPreview(input: RegistrationInput, creator: string, signature: string): Promise<string> {
  const preview = await createWatermarkedPreview(input.file, input.title, input.category, input.fileHash)
  const form = new FormData()
  form.set('preview', preview, 'karyachain-preview.webp')
  form.set('fileHash', input.fileHash)
  form.set('creator', creator)
  form.set('signature', signature)

  let response: Response
  try {
    response = await fetch('/api/ipfs/upload', { method: 'POST', body: form })
  } catch {
    throw new ProofServiceError('Koneksi unggah preview terputus. Coba kembali atau matikan opsi galeri untuk mendaftar secara privat.', 'IPFS_NETWORK')
  }
  const payload = await response.json() as { ipfsCid?: string; error?: string }
  if (!response.ok || !payload.ipfsCid) {
    throw new ProofServiceError(payload.error ?? 'Preview gagal diunggah. Coba kembali atau matikan opsi galeri untuk mendaftar secara privat.', 'IPFS_UPLOAD')
  }
  return payload.ipfsCid
}

export async function registerProof(
  input: RegistrationInput,
  onState: (state: RegistrationUiState) => void,
): Promise<ProofRecord> {
  const duplicate = await verifyWork(input.fileHash)
  if (duplicate) {
    throw new ProofServiceError('Hash karya ini sudah terdaftar dan tidak dapat diklaim ulang.', 'DUPLICATE', duplicate)
  }

  const provider = getWalletProvider()
  const network = await provider.getNetwork()
  if (network.chainId !== BigInt(ARBITRUM_SEPOLIA.chainId)) {
    throw new ProofServiceError('Ganti wallet ke jaringan yang didukung sebelum mendaftar.', 'WRONG_NETWORK')
  }
  const signer = await provider.getSigner()
  const creator = await signer.getAddress()

  onState('AWAITING_SIGNATURE')
  let signature: string
  try {
    signature = await signer.signMessage(getBytes(input.fileHash))
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 4001) {
      throw new ProofServiceError('Permintaan tanda tangan dibatalkan oleh Anda.', 'USER_REJECTED')
    }
    throw error
  }

  let ipfsCid = ''
  if (input.publishToGallery) {
    onState('UPLOADING_PREVIEW')
    ipfsCid = await uploadGalleryPreview(input, creator, signature)
  }

  const recordBase = {
    fileHash: input.fileHash,
    creator,
    timestamp: Math.floor(Date.now() / 1000),
    signature,
    title: input.publishToGallery ? input.title.trim() : '',
    category: input.publishToGallery ? input.category : '',
    ipfsCid,
  }

  if (isMockContract()) {
    const record: ProofRecord = { ...recordBase, txHash: null, isMock: true }
    addMockProof(record)
    return record
  }

  const address = getConfiguredContractAddress()
  if (!address) {
    throw new ProofServiceError('Kontrak belum di-deploy. Gunakan tombol deploy di halaman ini, lalu ulangi pendaftaran.', 'NO_CONTRACT')
  }
  const contract = new Contract(address, PROOF_OF_EXISTENCE_ABI, signer)
  onState('AWAITING_TX_APPROVAL')
  const transaction = await contract.getFunction('registerWork')(
    input.fileHash,
    signature,
    recordBase.title,
    recordBase.category,
    ipfsCid,
  )
  onState('MINING')
  const receipt = await transaction.wait()
  if (!receipt || receipt.status !== 1) {
    throw new ProofServiceError('Transaksi tidak berhasil dikonfirmasi. Periksa aktivitas dompet sebelum mencoba ulang.', 'TX_FAILED')
  }

  const confirmed = await verifyWork(input.fileHash)
  return {
    ...(confirmed ?? recordBase),
    txHash: transaction.hash,
    isMock: false,
  }
}

export async function deployProofContract(): Promise<{ address: string; blockNumber: number }> {
  const provider = getWalletProvider()
  const network = await provider.getNetwork()
  if (network.chainId !== BigInt(ARBITRUM_SEPOLIA.chainId)) {
    throw new ProofServiceError('Pindahkan wallet ke jaringan yang didukung sebelum deploy kontrak.', 'WRONG_NETWORK')
  }
  const signer = await provider.getSigner()
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer)
  const contract = await factory.deploy()
  const transaction = contract.deploymentTransaction()
  const receipt = await transaction?.wait()
  if (!receipt || receipt.status !== 1) {
    throw new ProofServiceError('Deploy kontrak belum terkonfirmasi. Periksa aktivitas dompet.', 'DEPLOY_FAILED')
  }
  const deployment = { address: await contract.getAddress(), blockNumber: receipt.blockNumber }
  setSessionDeployment(deployment)
  return deployment
}

export async function fetchGalleryProofs(): Promise<ProofRecord[]> {
  if (isMockContract()) return getMockGallery()
  const provider = getPublicProvider()
  const contract = getReadContract(provider)
  const latestBlock = await provider.getBlockNumber()
  const configuredStartBlock = Number(process.env.NEXT_PUBLIC_CONTRACT_START_BLOCK)
  const sessionStartBlock = getSessionDeployment()?.blockNumber
  const fromBlock = configuredStartBlock > 0
    ? configuredStartBlock
    : sessionStartBlock ?? Math.max(0, latestBlock - 250_000)
  const toBlock = latestBlock
  const eventInterface = new Interface(PROOF_OF_EXISTENCE_ABI)
  const eventFragment = eventInterface.getEvent('WorkRegistered')
  if (!eventFragment) throw new ProofServiceError('Event kontrak tidak ditemukan.', 'ABI_EVENT_MISSING')

  const address = await contract.getAddress()
  const records: ProofRecord[] = []
  const chunkSize = 10_000
  for (let start = fromBlock; start <= toBlock; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, toBlock)
    const logs = await provider.getLogs({
      address,
      fromBlock: start,
      toBlock: end,
      topics: [eventFragment.topicHash],
    })
    for (const log of logs) {
      const parsed = eventInterface.parseLog(log)
      if (!parsed) continue
      const [fileHash, creator, timestamp, title, category, ipfsCid] = parsed.args
      if (!String(ipfsCid)) continue
      records.push({
        fileHash: String(fileHash),
        creator: String(creator),
        timestamp: Number(timestamp),
        signature: '',
        title: String(title),
        category: String(category),
        ipfsCid: String(ipfsCid),
        txHash: log.transactionHash,
        isMock: false,
      })
    }
  }
  return records.sort((left, right) => right.timestamp - left.timestamp)
}

export function getTransactionExplorerUrl(txHash: string): string {
  return `${EXPLORER_URL.replace(/\/$/, '')}/tx/${txHash}`
}

export function getAddressExplorerUrl(address: string): string {
  return `${EXPLORER_URL.replace(/\/$/, '')}/address/${address}`
}
