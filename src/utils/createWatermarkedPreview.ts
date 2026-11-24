import type { WorkCategory } from '@/src/models/ProofRecord'

const MAX_EDGE = 800

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Gambar tidak dapat dibuka untuk membuat preview.'))
    }
    image.src = objectUrl
  })
}

export async function createWatermarkedPreview(
  file: File,
  title: string,
  category: WorkCategory,
  fileHash: string,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Browser tidak dapat membuat preview canvas.')

  let width = MAX_EDGE
  let height = MAX_EDGE
  let image: HTMLImageElement | null = null

  if (file.type.startsWith('image/')) {
    image = await loadImage(file)
    const scale = Math.min(1, MAX_EDGE / image.naturalWidth, MAX_EDGE / image.naturalHeight)
    width = Math.max(1, Math.round(image.naturalWidth * scale))
    height = Math.max(1, Math.round(image.naturalHeight * scale))
  }

  canvas.width = width
  canvas.height = height
  context.fillStyle = '#f8f9fa'
  context.fillRect(0, 0, width, height)

  if (image) {
    context.drawImage(image, 0, 0, width, height)
  } else {
    context.fillStyle = '#0a0a0a'
    context.fillRect(0, 0, width, height)
    context.fillStyle = '#e8ff00'
    context.fillRect(34, 38, 7, 48)
    context.fillStyle = '#ffffff'
    context.font = '600 25px sans-serif'
    context.fillText(category.toUpperCase(), 58, 58, width - 90)
    context.font = '700 43px sans-serif'
    const safeTitle = title.trim() || 'Karya tanpa judul'
    context.fillText(safeTitle.slice(0, 28), 36, Math.round(height * 0.42), width - 72)
    context.fillStyle = '#c4c4c4'
    context.font = '500 18px monospace'
    const mediaLabel = file.type.startsWith('audio/')
      ? 'AUDIO · WAVEFORM PREVIEW'
      : file.type.startsWith('video/')
        ? 'VIDEO · COVER PREVIEW'
        : 'DOKUMEN · PREVIEW'
    context.fillText(mediaLabel, 38, Math.round(height * 0.53), width - 76)

    if (file.type.startsWith('audio/')) {
      const barCount = 56
      const slotWidth = (width - 72) / barCount
      const waveformTop = Math.round(height * 0.66)
      const waveformHeight = Math.round(height * 0.15)
      context.fillStyle = '#e8ff00'
      for (let index = 0; index < barCount; index += 1) {
        const nibble = Number.parseInt(fileHash[(index % 64) + 2], 16)
        const barHeight = Math.max(5, Math.round((nibble / 15) * waveformHeight))
        const x = 36 + index * slotWidth
        context.fillRect(x, waveformTop + (waveformHeight - barHeight) / 2, Math.max(2, slotWidth - 3), barHeight)
      }
    } else if (file.type.startsWith('video/')) {
      context.strokeStyle = '#e8ff00'
      context.lineWidth = 3
      context.strokeRect(36, Math.round(height * 0.63), width - 72, Math.round(height * 0.2))
      context.beginPath()
      context.moveTo(width / 2 - 13, Math.round(height * 0.68))
      context.lineTo(width / 2 + 15, Math.round(height * 0.73))
      context.lineTo(width / 2 - 13, Math.round(height * 0.78))
      context.closePath()
      context.fillStyle = '#e8ff00'
      context.fill()
    } else {
      context.strokeStyle = '#e8ff00'
      context.lineWidth = 2
      context.strokeRect(36, Math.round(height * 0.63), width - 72, Math.round(height * 0.2))
      context.fillStyle = '#c4c4c4'
      context.font = '500 16px monospace'
      context.fillText('MASTER FILE TETAP LOKAL', 52, Math.round(height * 0.74))
    }
  }

  context.save()
  context.translate(width / 2, height / 2)
  context.rotate(-Math.PI / 5)
  context.fillStyle = 'rgba(10, 10, 10, 0.32)'
  context.font = '700 21px sans-serif'
  context.textAlign = 'center'
  context.fillText('DIGITALARTCHAIN · VERIFIED PREVIEW', 0, 0, width * 1.3)
  context.restore()

  const footerHeight = Math.max(38, Math.round(height * 0.075))
  context.fillStyle = 'rgba(10, 10, 10, 0.88)'
  context.fillRect(0, height - footerHeight, width, footerHeight)
  context.fillStyle = '#ffffff'
  context.font = `500 ${Math.max(11, Math.round(footerHeight * 0.32))}px monospace`
  context.textAlign = 'left'
  context.fillText(`${fileHash.slice(0, 10)}…${fileHash.slice(-8)}`, 14, height - Math.round(footerHeight * 0.38), width - 28)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Preview WebP gagal dibuat.'))
    }, 'image/webp', 0.82)
  })
}
