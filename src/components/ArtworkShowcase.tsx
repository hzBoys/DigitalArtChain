'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { Fingerprint } from 'lucide-react'

const artworks = [
  {
    title: 'Ashina',
    artist: '@exhozt_',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ashina-%E1%B4%98%CA%80%C9%AA%C9%B4%E1%B4%9B%EA%9C%B1%20-%20%C9%B4%EA%9C%B0%E1%B4%9B%20-%20%E1%B4%8D%E1%B4%8F%CA%80%E1%B4%87%CA%9F%C9%AA%C9%B4%E1%B4%8B%20%E1%B4%8F%C9%B4%20%E1%B4%8D%CA%8F%20%CA%99%C9%AA%E1%B4%8F%40exhozt%C2%A0%40exhozt_swipe%20for%20full._lofiart_animeaesthetic_p-xM7fFpUIDDbVTJiLt9pvlSPpc3MEi9.jpg',
    alt: 'Pagoda di bawah langit senja biru dan pohon sakura ungu',
  },
  {
    title: 'Exhausted',
    artist: '@rubahitam',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/90__motiondesign%20_motiongraphics%20_animation%20_3d%20_3dart%20_3drender%20_3danimation%20_cinema4d%20_c4d%20_sk-Ik8PY4DNsLWy2W6D8MePcB48sjPVfe.jpg',
    alt: 'Karya digital penuh warna menampilkan perangkat musik dan teknologi dalam ruang futuristik',
  },
  {
    title: "YOU CAN'T KILL ME",
    artist: '@bangerboyzz',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/YOU%20CAN%E2%80%99T%20KILL%20ME%20by%20%40bangerboyzz%20%F0%9F%97%A1Go%20show%20him%20some%20support%20for%20this%20absolutely%20sick%20artwork%21%F0%9F%90%88-qIfmcrLbzqdymh4aYdHANAAfMlAPdB.jpg',
    alt: 'Sosok berzirah gelap dengan pedang di kota malam berhujan',
  },
]

export function ArtworkShowcase() {
  const stackRef = useRef<HTMLDivElement>(null)

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !stackRef.current) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    stackRef.current.style.setProperty('--tilt-x', `${-y * 5}deg`)
    stackRef.current.style.setProperty('--tilt-y', `${x * 7}deg`)
  }

  function resetTilt() {
    stackRef.current?.style.setProperty('--tilt-x', '0deg')
    stackRef.current?.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <div
      className="proof-card-stack"
      ref={stackRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      aria-label="Tumpukan tiga karya digital"
    >
      {artworks.map((artwork, index) => (
        <article
          className={`proof-card proof-card-layer proof-card-layer-${index + 1}`}
          key={artwork.title}
          aria-label={`${artwork.title}, karya oleh ${artwork.artist}`}
        >
          <div className="proof-artwork">
            <Image
              className="proof-artwork-image"
              src={artwork.image}
              alt={artwork.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 640px) 84vw, 370px"
            />
            <div className="proof-artwork-tags" aria-hidden="true"><span>KARYA DIGITAL</span><span>SHA-256</span></div>
            <span className="proof-artwork-index" aria-hidden="true">DAC / 0{index + 1}</span>
          </div>
          <div className="proof-card-info">
            <div className="proof-card-title-wrap">
              <span className="proof-card-label">IDENTITAS KARYA</span>
              <strong>{artwork.title}</strong>
              <span className="proof-card-artist">Karya oleh {artwork.artist}</span>
            </div>
            <span className="proof-card-icon"><Fingerprint size={20} strokeWidth={1.5} aria-hidden="true" /></span>
          </div>
          <div className="proof-card-footer"><span>SIDIK JARI KRIPTOGRAFIS</span><span>256-BIT</span></div>
        </article>
      ))}
    </div>
  )
}
