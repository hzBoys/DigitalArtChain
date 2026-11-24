'use client'

import { useRef, useState } from 'react'
import { FileUp, Fingerprint, LoaderCircle, ShieldCheck } from 'lucide-react'

interface FileDropzoneProps {
  file: File | null
  hash: string | null
  isHashing: boolean
  onFile: (file: File) => void
}

export function FileDropzone({ file, hash, isHashing, onFile }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const openPicker = () => inputRef.current?.click()

  return (
    <div
      className={`workflow-dropzone${isDragging ? ' is-dragging' : ''}${file ? ' has-file' : ''}`}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
      onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false) }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        const nextFile = event.dataTransfer.files.item(0)
        if (nextFile) onFile(nextFile)
      }}
    >
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        aria-label="Pilih file master untuk dihitung sidik jarinya"
        onChange={(event) => {
          const nextFile = event.target.files?.item(0)
          if (nextFile) onFile(nextFile)
          event.target.value = ''
        }}
      />
      <div className="dropzone-icon" aria-hidden="true">
        {isHashing ? <LoaderCircle className="workflow-spinner" /> : file ? <ShieldCheck /> : <FileUp />}
      </div>
      <div className="dropzone-copy">
        <strong>{isHashing ? 'Menghitung SHA-256 secara lokal…' : file ? file.name : 'Tarik file karya ke sini'}</strong>
        <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · ${file.type || 'tipe file tidak diketahui'}` : 'Gambar, audio, video, dokumen · maksimal 50 MB'}</span>
      </div>
      <button className="workflow-button workflow-button-outline dropzone-button" type="button" onClick={openPicker} disabled={isHashing}>
        {file ? 'Pilih file lain' : 'Pilih file'}
      </button>
      {hash && (
        <div className="fingerprint-result" aria-live="polite">
          <div className="fingerprint-heading"><Fingerprint aria-hidden="true" /><span>SHA-256 · 256 BIT</span><span className="fingerprint-local"><ShieldCheck aria-hidden="true" /> LOKAL</span></div>
          <code>{hash}</code>
          <p>Sidik jari ini dibuat di perangkat Anda. File master tidak diunggah.</p>
        </div>
      )}
    </div>
  )
}
