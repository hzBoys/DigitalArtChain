'use client'

import { useEffect, useRef } from 'react'
import { RotateCcw } from 'lucide-react'

interface ResetConfirmationDialogProps {
  onCancel: () => void
  onConfirm: () => void
}

export function ResetConfirmationDialog({ onCancel, onConfirm }: ResetConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="reset-confirmation-dialog"
      role="alertdialog"
      aria-labelledby="reset-confirmation-title"
      aria-describedby="reset-confirmation-description"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div className="reset-confirmation-content">
        <div className="reset-confirmation-icon" aria-hidden="true"><RotateCcw /></div>
        <p className="workflow-overline">RESET / CATAT KARYA</p>
        <h2 id="reset-confirmation-title">Mulai ulang proses pencatatan?</h2>
        <p id="reset-confirmation-description">
          Semua isian, file yang dipilih, fingerprint, dan pilihan publikasi akan dihapus. Bukti yang sudah tercatat di blockchain tidak dapat dibatalkan atau dihapus.
        </p>
        <div className="reset-confirmation-actions">
          <button className="workflow-button workflow-button-outline" type="button" autoFocus onClick={onCancel}>Batal</button>
          <button className="workflow-button workflow-button-danger" type="button" onClick={onConfirm}>Ya, reset proses</button>
        </div>
      </div>
    </dialog>
  )
}
