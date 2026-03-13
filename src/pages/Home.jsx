import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BuildCard from '../components/BuildCard'

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-thumb" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line" style={{ width: '70%' }} />
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line xshort" style={{ marginTop: 8 }} />
      </div>
    </div>
  )
}

const DIFFICULTY_LABELS = {
  anfaenger: 'Anfänger',
  fortgeschritten: 'Fortgeschritten',
  experte: 'Experte',
}

export default function Home() {
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const [activeDiff, setActiveDiff] = useState(null)
  const [sortOrder, setSortOrder] = useState('newest')

  useEffect(() => {
    async function fetchBuilds() {
      const { data, error } = await supabase
        .from('builds')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setBuilds(data || [])
      }
      setLoading(false)
    }
    fetchBuilds()
  }, [])

  // Collect all tags that exist in the data
  const allTags = [...new Set(builds.flatMap(b => b.tags || []))]

  let filtered = builds
  if (query.trim()) {
    const q = query.toLowerCase()
    filtered = filtered.filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q)
    )
  }
  if (activeTag) filtered = filtered.filter(b => b.tags?.includes(activeTag))
  if (activeDiff) filtered = filtered.filter(b => b.difficulty === activeDiff)

  if (sortOrder === 'oldest') {
    filtered = [...filtered].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } else if (sortOrder === 'az') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }

  const hasFilters = query.trim() || activeTag || activeDiff

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <section className="hero">
          <p className="hero-eyebrow">Redstone Engineering</p>
          <h1 className="hero-title">
            Willkommen im<br />
            <span className="accent">Redstonelab_</span>
          </h1>
          <p className="hero-sub">
            Entdecke beeindruckende Redstone-Konstruktionen mit
            detaillierten Schritt-für-Schritt-Anleitungen.
          </p>
        </section>

        <div className="hero-divider">
          <span>— Alle Builds</span>
        </div>

        {/* Search + Sort */}
        {!loading && builds.length > 0 && (
          <>
            <div className="search-row">
              <div className="search-bar">
                <svg className="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="8.5" cy="8.5" r="5.5" />
                  <line x1="13" y1="13" x2="18" y2="18" />
                </svg>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Build suchen…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoComplete="off"
                />
                {query && (
                  <button className="search-clear" onClick={() => setQuery('')} aria-label="Suche leeren">
                    ×
                  </button>
                )}
              </div>
              <select
                className="sort-select"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                aria-label="Sortierung"
              >
                <option value="newest">Neueste</option>
                <option value="oldest">Älteste</option>
                <option value="az">Name A–Z</option>
              </select>
            </div>

            {/* Tag filter chips */}
            {allTags.length > 0 && (
              <div className="filter-row">
                <button
                  className={`filter-chip${!activeTag ? ' filter-chip-active' : ''}`}
                  onClick={() => setActiveTag(null)}
                >
                  Alle
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`filter-chip${activeTag === tag ? ' filter-chip-active' : ''}`}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Difficulty filter chips */}
            <div className="filter-row">
              <button
                className={`filter-chip${!activeDiff ? ' filter-chip-active' : ''}`}
                onClick={() => setActiveDiff(null)}
              >
                Alle Level
              </button>
              {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={`filter-chip filter-chip-diff-${key}${activeDiff === key ? ' filter-chip-active' : ''}`}
                  onClick={() => setActiveDiff(activeDiff === key ? null : key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Grid */}
        {error && (
          <div className="msg msg-error">
            Fehler beim Laden: {error}
          </div>
        )}

        {loading ? (
          <div className="build-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : builds.length === 0 ? (
          <div className="no-builds">
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>⬛</div>
            <h2>Noch keine Builds vorhanden</h2>
            <p>Der Admin hat noch keine Redstone-Builds hinzugefügt.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-builds">
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>⬛</div>
            <h2>Keine Treffer</h2>
            <p>Kein Build passt zu den gewählten Filtern.</p>
          </div>
        ) : (
          <>
            <p className="build-count">
              {hasFilters
                ? <><strong>{filtered.length}</strong> von {builds.length} Build{builds.length !== 1 ? 's' : ''}</>
                : <><strong>{builds.length}</strong> Build{builds.length !== 1 ? 's' : ''} gefunden</>
              }
            </p>
            <div className="build-grid">
              {filtered.map((build, i) => (
                <div
                  key={build.id}
                  style={{ animation: `fadeUp 350ms ${i * 60}ms ease both` }}
                >
                  <BuildCard build={build} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
