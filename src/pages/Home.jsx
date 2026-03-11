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

export default function Home() {
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        ) : (
          <>
            <p className="build-count">
              <strong>{builds.length}</strong> Build{builds.length !== 1 ? 's'  : ''} gefunden
            </p>
            <div className="build-grid">
              {builds.map((build, i) => (
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
