import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(0, c - 1))
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(images.length - 1, c + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  return (
    <div
      className="lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Bild-Lightbox"
    >
      <button className="lightbox-close" onClick={onClose} aria-label="Schließen">✕</button>

      {current > 0 && (
        <button
          className="lightbox-nav lightbox-prev"
          onClick={e => { e.stopPropagation(); setCurrent(c => c - 1) }}
          aria-label="Vorheriges Bild"
        >
          ‹
        </button>
      )}

      <img
        src={images[current].url}
        alt={`Schritt ${current + 1}`}
        onClick={e => e.stopPropagation()}
      />

      {current < images.length - 1 && (
        <button
          className="lightbox-nav lightbox-next"
          onClick={e => { e.stopPropagation(); setCurrent(c => c + 1) }}
          aria-label="Nächstes Bild"
        >
          ›
        </button>
      )}

      <span className="lightbox-counter">
        {current + 1} / {images.length}
      </span>
    </div>
  )
}

export default function BuildDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [build, setBuild] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    async function fetchBuild() {
      const [buildRes, imagesRes] = await Promise.all([
        supabase.from('builds').select('*').eq('id', id).single(),
        supabase.from('build_images').select('*').eq('build_id', id).order('order_index'),
      ])

      if (buildRes.error) {
        setError(buildRes.error.message)
      } else {
        setBuild(buildRes.data)
        setImages(imagesRes.data || [])
      }
      setLoading(false)
    }
    fetchBuild()
  }, [id])

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    )
  }

  if (error || !build) {
    return (
      <div className="page">
        <div className="container">
          <div className="msg msg-error">
            {error || 'Build nicht gefunden.'}
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← Zurück</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        {/* Back */}
        <button className="detail-back" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Zurück zur Übersicht
        </button>

        {/* Hero image */}
        <div className="detail-hero">
          {build.thumbnail_url ? (
            <img src={build.thumbnail_url} alt={build.name} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--bg-2)' }} />
          )}
          <div className="detail-hero-overlay">
            <p className="detail-eyebrow">Redstone Build</p>
            <h1 className="detail-title">{build.name}</h1>
          </div>
        </div>

        {/* Description */}
        {build.description && (
          <div className="detail-desc">
            {build.description}
          </div>
        )}

        {/* Instruction steps */}
        {images.length > 0 && (
          <>
            <div className="detail-steps-header">
              <h2>Anleitung</h2>
            </div>
            <div className="steps-grid">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="step-item"
                  onClick={() => setLightboxIndex(i)}
                  style={{ animation: `fadeUp 300ms ${i * 50}ms ease both` }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setLightboxIndex(i)}
                  aria-label={`Schritt ${i + 1} vergrößern`}
                >
                  <div className="step-thumb">
                    <img src={img.url} alt={`Schritt ${i + 1}`} loading="lazy" />
                  </div>
                  <div className="step-label">
                    <span className="step-num">#{i + 1}</span>
                    <span>Schritt {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}
