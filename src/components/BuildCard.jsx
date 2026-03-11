import { useNavigate } from 'react-router-dom'

function ThumbPlaceholder() {
  const pattern = [1,0,1,0,1,0,1,0,1,0,1,0]
  return (
    <div className="card-thumb-placeholder">
      <div className="placeholder-grid">
        {pattern.map((v, i) => (
          <span key={i} style={{ opacity: v ? 1 : 0 }} />
        ))}
      </div>
    </div>
  )
}

export default function BuildCard({ build }) {
  const navigate = useNavigate()
  const date = new Date(build.created_at).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <article
      className="build-card"
      onClick={() => navigate(`/build/${build.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/build/${build.id}`)}
      aria-label={`Build öffnen: ${build.name}`}
    >
      <div className="card-thumb">
        {build.thumbnail_url ? (
          <img src={build.thumbnail_url} alt={build.name} loading="lazy" />
        ) : (
          <ThumbPlaceholder />
        )}
        <div className="card-overlay">
          <span className="card-view-btn">ANSEHEN →</span>
        </div>
        <div className="card-scanline" aria-hidden="true" />
      </div>

      <div className="card-body">
        <h2 className="card-name">{build.name}</h2>
        {build.description && (
          <p className="card-desc">{build.description}</p>
        )}
        <div className="card-meta">
          {date}
        </div>
      </div>
    </article>
  )
}
