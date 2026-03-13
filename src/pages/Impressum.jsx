export default function Impressum() {
  return (
    <div className="page">
      <div className="container">
        <div className="impressum-box">
          <div className="impressum-eyebrow">Rechtliches</div>
          <h1 className="impressum-title">Impressum</h1>

          <div className="impressum-section">
            <div className="impressum-label">Betreiber</div>
            <div className="impressum-value">Julian v.d.W.</div>
          </div>

          <div className="impressum-section">
            <div className="impressum-label">Land</div>
            <div className="impressum-value">Deutschland</div>
          </div>

          <div className="impressum-section">
            <div className="impressum-label">Art des Projekts</div>
            <div className="impressum-value">Privates Hobbyprojekt — nicht kommerziell</div>
          </div>

          <div className="impressum-section">
            <div className="impressum-label">Datenerfassung</div>
            <div className="impressum-value impressum-green">
              Es werden keine personenbezogenen Daten erfasst, gespeichert oder weitergegeben.
            </div>
          </div>

          <div className="impressum-note">
            Diese Website dient ausschließlich der privaten Dokumentation von Minecraft-Redstone-Builds.
            Es besteht kein kommerzieller Hintergrund.
          </div>
        </div>
      </div>
    </div>
  )
}
