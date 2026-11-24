'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, CircleAlert, ExternalLink, LoaderCircle, LockKeyhole, ShieldCheck, WalletCards } from 'lucide-react'
import { useWallet } from '@/src/controllers/useWallet'
import { useFileHasher } from '@/src/controllers/useFileHasher'
import { FileDropzone } from '@/src/components/registration/FileDropzone'
import { ReceiptModal } from '@/src/components/registration/ReceiptModal'
import { StepStatus } from '@/src/components/registration/StepStatus'
import { ARBITRUM_SEPOLIA, METAMASK_DOWNLOAD_URL } from '@/src/models/networkConfig'
import { WORK_CATEGORIES, type ProofRecord, type RegistrationUiState, type WorkCategory } from '@/src/models/ProofRecord'
import { ProofServiceError, deployProofContract, getConfiguredContractAddress, isMockContract, registerProof, verifyWork } from '@/src/services/contractService'

const stateLabels: Partial<Record<RegistrationUiState, string>> = {
  HASHING: 'Menghitung SHA-256 secara lokal…',
  PRE_CHECKING: 'Mengecek pendaftaran sebelumnya…',
  UPLOADING_PREVIEW: 'Mengunggah preview ber-watermark ke IPFS…',
  AWAITING_SIGNATURE: 'Konfirmasi tanda tangan di MetaMask…',
  AWAITING_TX_APPROVAL: 'Konfirmasi transaksi di MetaMask…',
  MINING: 'Menunggu konfirmasi Arbitrum Sepolia…',
}

export function RegistrationWorkspace() {
  const wallet = useWallet()
  const { hash, error: hashError, isHashing, hashFile, resetHash } = useFileHasher()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<RegistrationUiState>('IDLE')
  const [error, setError] = useState<string | null>(null)
  const [duplicateRecord, setDuplicateRecord] = useState<ProofRecord | null>(null)
  const [precheckPassed, setPrecheckPassed] = useState(false)
  const [receipt, setReceipt] = useState<ProofRecord | null>(null)
  const [publishToGallery, setPublishToGallery] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<WorkCategory>('Ilustrasi')
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentAddress, setDeploymentAddress] = useState<string | null>(null)
  const [deploymentError, setDeploymentError] = useState<string | null>(null)
  const mockMode = isMockContract()

  async function selectFile(nextFile: File) {
    setFile(nextFile)
    setReceipt(null)
    setDuplicateRecord(null)
    setPrecheckPassed(false)
    setError(null)
    setStatus('HASHING')
    const nextHash = await hashFile(nextFile)
    if (!nextHash) {
      setStatus('ERROR')
      return
    }
    if (!mockMode && !getConfiguredContractAddress()) {
      setStatus('READY_TO_SIGN')
      return
    }
    setStatus('PRE_CHECKING')
    try {
      const existing = await verifyWork(nextHash)
      if (existing) {
        setDuplicateRecord(existing)
        setStatus('DUPLICATE_DETECTED')
      } else {
        setPrecheckPassed(true)
        setStatus('READY_TO_SIGN')
      }
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : 'Pemeriksaan hash belum berhasil.')
      setStatus('ERROR')
    }
  }

  async function handleRegistration() {
    if (!file || !hash) return
    setError(null)
    setDuplicateRecord(null)
    if (!wallet.isConnected) {
      setError('Hubungkan MetaMask terlebih dahulu untuk menandatangani bukti.')
      await wallet.connectWallet()
      return
    }
    if (!wallet.isCorrectNetwork) {
      setError('Pilih jaringan Arbitrum Sepolia sebelum melanjutkan.')
      await wallet.switchToArbitrumSepolia()
      return
    }
    if (!mockMode && !getConfiguredContractAddress()) {
      setError('Deploy kontrak terlebih dahulu. Gunakan panel deploy di bawah.')
      return
    }

    try {
      const record = await registerProof({ file, fileHash: hash, title, category, publishToGallery }, setStatus)
      setReceipt(record)
      setStatus('SUCCESS')
    } catch (registrationError) {
      if (registrationError instanceof ProofServiceError && registrationError.code === 'DUPLICATE') {
        setDuplicateRecord(registrationError.existingRecord ?? null)
        setStatus('DUPLICATE_DETECTED')
        return
      }
      setError(registrationError instanceof Error ? registrationError.message : 'Pendaftaran gagal. Periksa dompet, lalu coba kembali.')
      setStatus('ERROR')
    }
  }

  async function handleDeploy() {
    setIsDeploying(true)
    setDeploymentError(null)
    try {
      const deployment = await deployProofContract()
      setDeploymentAddress(deployment.address)
      if (hash) {
        setStatus('PRE_CHECKING')
        const existing = await verifyWork(hash)
        setDuplicateRecord(existing)
        setPrecheckPassed(!existing)
        setStatus(existing ? 'DUPLICATE_DETECTED' : 'READY_TO_SIGN')
      } else {
        setStatus('IDLE')
      }
    } catch (deployError) {
      setDeploymentError(deployError instanceof Error ? deployError.message : 'Deploy gagal. Coba kembali.')
      setStatus(hash ? 'ERROR' : 'IDLE')
    } finally {
      setIsDeploying(false)
    }
  }

  function resetForm() {
    setFile(null)
    setTitle('')
    setPublishToGallery(false)
    setDuplicateRecord(null)
    setPrecheckPassed(false)
    setReceipt(null)
    setError(null)
    resetHash()
    setStatus('IDLE')
  }

  const contractAddress = deploymentAddress ?? getConfiguredContractAddress()
  const isBusy = Boolean(stateLabels[status])
  const canRegister = Boolean(file && hash && precheckPassed && !isBusy && status !== 'DUPLICATE_DETECTED' && status !== 'SUCCESS' && wallet.isConnected && wallet.isCorrectNetwork && (mockMode || contractAddress))

  return (
    <div className="workflow-page">
      <div className="workflow-page-heading">
        <div><p className="workflow-overline">DAFTAR KARYA / 01</p><h1>Catat bukti digital.</h1><p>Hash adalah sidik jari karya Anda. File master tetap di perangkat—yang dicatat hanyalah fingerprint.</p></div>
        <span className={`mode-badge${mockMode ? ' is-mock' : ' is-live'}`}><span />{mockMode ? 'MODE SIMULASI' : contractAddress ? 'KONTRAK TESTNET' : 'KONTRAK BELUM AKTIF'}</span>
      </div>
      <StepStatus state={status} />

      <div className="registration-layout">
        <section className="registration-main" aria-label="Form pendaftaran">
          <section className="workflow-panel" aria-labelledby="file-panel-title">
            <div className="workflow-panel-heading"><span className="workflow-section-number">01</span><div><h2 id="file-panel-title">Pilih file karya</h2><p>Kami menghitung SHA-256 langsung di browser Anda.</p></div></div>
            <FileDropzone file={file} hash={hash} isHashing={isHashing} onFile={(nextFile) => { void selectFile(nextFile) }} />
            {hashError && <p className="workflow-inline-error" role="alert">{hashError}</p>}
            {status === 'PRE_CHECKING' && <p className="workflow-status-line" role="status"><LoaderCircle className="workflow-spinner" aria-hidden="true" /> Memeriksa apakah fingerprint ini sudah tercatat…</p>}
            {status === 'READY_TO_SIGN' && hash && <p className="workflow-status-line is-ok" role="status"><Check aria-hidden="true" /> Fingerprint unik pada pemeriksaan ini.</p>}
            {duplicateRecord && <div className="workflow-notice notice-warning" role="status"><CircleAlert aria-hidden="true" /><span>Hash ini sudah memiliki bukti sejak {new Date(duplicateRecord.timestamp * 1000).toLocaleDateString('id-ID')}. Satu hash hanya dapat didaftarkan satu kali. <Link href={`/verify?hash=${encodeURIComponent(duplicateRecord.fileHash)}`}>Buka verifikasi</Link></span></div>}
          </section>

          <section className="workflow-panel" aria-labelledby="privacy-panel-title">
            <div className="workflow-panel-heading"><span className="workflow-section-number">02</span><div><h2 id="privacy-panel-title">Pilih tingkat publikasi</h2><p>Metadata opsional. Fingerprint tetap dicatat walau preview tidak dibagikan.</p></div></div>
            <label className="workflow-toggle-row">
              <input type="checkbox" checked={publishToGallery} onChange={(event) => setPublishToGallery(event.target.checked)} />
              <span className="workflow-toggle-track" aria-hidden="true" />
              <span className="workflow-toggle-copy"><strong>Tampilkan preview di Galeri Publik</strong><span>Opsional · hanya preview ter-watermark yang diunggah, bukan file master.</span></span>
            </label>
            {publishToGallery && (
              <div className="workflow-metadata-fields">
                <label className="workflow-field"><span>Judul karya <small>opsional</small></span><input className="workflow-input" value={title} onChange={(event) => setTitle(event.target.value.slice(0, 80))} maxLength={80} placeholder="Contoh: Senja di Ujung Kota" /></label>
                <label className="workflow-field"><span>Kategori</span><select className="workflow-input" value={category} onChange={(event) => setCategory(event.target.value as WorkCategory)}>{WORK_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <div className="workflow-notice notice-neutral"><LockKeyhole aria-hidden="true" /><span>Preview publik tidak dapat ditarik kembali setelah terunggah ke IPFS. Periksa isi preview sebelum menyetujuinya.</span></div>
              </div>
            )}
          </section>

          <section className="workflow-panel" aria-labelledby="wallet-panel-title">
            <div className="workflow-panel-heading"><span className="workflow-section-number">03</span><div><h2 id="wallet-panel-title">Tanda tangani dan catat</h2><p>Dompet membuktikan siapa yang meminta timestamp ini.</p></div></div>
            {mockMode ? (
              <div className="workflow-notice notice-warning"><CircleAlert aria-hidden="true" /><span>Simulasi aktif: MetaMask tetap diminta untuk tanda tangan, tetapi transaksi dan catatan hanya berada di memori tab ini. Tidak ada bukti on-chain.</span></div>
            ) : (
              <div className="workflow-notice notice-neutral"><ShieldCheck aria-hidden="true" /><span>Jaringan target: {ARBITRUM_SEPOLIA.chainName}. Pencatatan menghasilkan transaksi yang memerlukan gas testnet.</span></div>
            )}
            {!mockMode && !contractAddress && (
              <div className="deploy-card">
                <div><strong>Kontrak belum ter-deploy</strong><p>Deploy kontrak registri ke Arbitrum Sepolia menggunakan dompet Anda. Saldo test ETH diperlukan.</p></div>
                <button className="workflow-button workflow-button-outline" type="button" onClick={() => void handleDeploy()} disabled={isDeploying || !wallet.isConnected || !wallet.isCorrectNetwork}>
                  {isDeploying ? <LoaderCircle className="workflow-spinner" aria-hidden="true" /> : <WalletCards aria-hidden="true" />}{isDeploying ? 'Menunggu MetaMask…' : 'Deploy kontrak'}
                </button>
                {deploymentAddress && <p className="deploy-success" role="status">Kontrak sesi aktif: <code>{deploymentAddress}</code>. Simpan alamat ini di <code>NEXT_PUBLIC_CONTRACT_ADDRESS</code> dan set <code>NEXT_PUBLIC_USE_MOCK_CONTRACT=false</code> agar tetap tersedia setelah refresh.</p>}
                {deploymentError && <p className="workflow-inline-error" role="alert">{deploymentError}</p>}
              </div>
            )}
            {!wallet.hasMetaMask && <div className="workflow-notice notice-neutral"><WalletCards aria-hidden="true" /><span>MetaMask diperlukan untuk membuktikan kepemilikan dompet dan memberikan tanda tangan. <a href={METAMASK_DOWNLOAD_URL} target="_blank" rel="noreferrer">Pasang MetaMask <ExternalLink aria-hidden="true" /></a></span></div>}
            {wallet.isConnected && !wallet.isCorrectNetwork && <div className="workflow-notice notice-error"><CircleAlert aria-hidden="true" /><span>Dompet terhubung di jaringan lain. <button type="button" className="inline-action" onClick={() => void wallet.switchToArbitrumSepolia()}>Ganti ke Arbitrum Sepolia</button></span></div>}
            {wallet.error && <div className="workflow-notice notice-error" role="alert">{wallet.error}<button className="inline-action" type="button" onClick={wallet.clearError}>Tutup</button></div>}
            {error && <div className="workflow-notice notice-error" role="alert">{error}</div>}
            {isBusy && <p className="workflow-status-line" role="status"><LoaderCircle className="workflow-spinner" aria-hidden="true" />{stateLabels[status]}</p>}
            <div className="registration-actions">
              {!wallet.isConnected ? (
                <button className="workflow-button workflow-button-primary" type="button" onClick={() => void wallet.connectWallet()} disabled={!wallet.hasMetaMask || wallet.isConnecting || !file || !hash}>
                  {wallet.isConnecting ? <LoaderCircle className="workflow-spinner" aria-hidden="true" /> : <WalletCards aria-hidden="true" />}{wallet.isConnecting ? 'Menghubungkan…' : 'Hubungkan MetaMask'}
                </button>
              ) : (
                <button className="workflow-button workflow-button-primary" type="button" onClick={() => void handleRegistration()} disabled={!canRegister}>
                  {isBusy ? <LoaderCircle className="workflow-spinner" aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}{mockMode ? 'Tanda tangani bukti simulasi' : 'Tanda tangani & catat'}<ArrowRight aria-hidden="true" />
                </button>
              )}
              <span className="workflow-wallet-caption">{wallet.isConnected ? `${wallet.address?.slice(0, 6)}…${wallet.address?.slice(-4)} · ${wallet.isCorrectNetwork ? ARBITRUM_SEPOLIA.chainName : 'ganti jaringan'}` : 'Perlu dompet kompatibel EVM'}</span>
            </div>
          </section>
        </section>

        <aside className="registration-aside" aria-label="Informasi dan privasi">
          <div className="aside-index">KC / 01</div>
          <h2>Yang dicatat bukan file Anda.</h2>
          <p>SHA-256 menghasilkan sidik jari unik dari file. Tanpa file asli, karya tak bisa direkonstruksi dari fingerprint.</p>
          <div className="aside-steps"><div><span>01</span><p>File dibaca lokal oleh browser.</p></div><div><span>02</span><p>Hash ditandatangani dompet Anda.</p></div><div><span>03</span><p>Hash dan timestamp dicatat di chain.</p></div></div>
          <div className="aside-lock"><LockKeyhole aria-hidden="true" /><span>File master tidak pernah meninggalkan perangkat.</span></div>
          <Link href="/verify" className="aside-link">Cara memverifikasi bukti <ArrowRight aria-hidden="true" /></Link>
        </aside>
      </div>
      {receipt && <ReceiptModal record={receipt} onClose={() => setReceipt(null)} />}
      {status === 'SUCCESS' && <div className="sr-only" role="status">Pendaftaran bukti berhasil.</div>}
      {status === 'ERROR' && !error && hashError && <div className="sr-only" role="alert">{hashError}</div>}
      <button className="workflow-text-button" type="button" onClick={resetForm}>Mulai ulang proses</button>
    </div>
  )
}
