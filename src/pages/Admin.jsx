import { useState, useEffect, useRef, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import SortableImage from '../components/SortableImage'

// ── Helper: get file extension ──────────────────────────
function ext(file) {
  return file.name.split('.').pop().toLowerCase()
}

const ALL_TAGS = ['Tür', 'Farm', 'Rechner', 'Logik', 'Falle', 'Anzeige', 'Sonstiges']

// ── Add Build Form ───────────────────────────────────────
function AddBuildForm({ onBuildAdded }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [tags, setTags] = useState([])
  const [thumbnail, setThumbnail] = useState(null)      // { file, preview }
  const [stepImages, setStepImages] = useState([])       // [{ id, file, preview, name }]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const thumbInputRef = useRef(null)
  const stepsInputRef = useRef(null)

  function toggleTag(tag) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleThumbSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbnail({ file, preview: URL.createObjectURL(file) })
  }

  function handleStepsSelect(e) {
    const files = Array.from(e.target.files || [])
    const newImages = files.map(file => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }))
    setStepImages(prev => [...prev, ...newImages])
    // Reset input so same files can be re-added if needed
    e.target.value = ''
  }

  function removeStepImage(id) {
    setStepImages(prev => prev.filter(img => img.id !== id))
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setStepImages(prev => {
        const oldIdx = prev.findIndex(img => img.id === active.id)
        const newIdx = prev.findIndex(img => img.id === over.id)
        return arrayMove(prev, oldIdx, newIdx)
      })
    }
  }

  function reset() {
    setName('')
    setDescription('')
    setDifficulty('')
    setTags([])
    setThumbnail(null)
    setStepImages([])
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const buildId = uuidv4()

      // 1. Upload thumbnail
      let thumbnailUrl = null
      let thumbnailPath = null
      if (thumbnail) {
        const path = `${buildId}/thumb.${ext(thumbnail.file)}`
        const { error: upErr } = await supabase.storage
          .from('builds')
          .upload(path, thumbnail.file, { upsert: false })
        if (upErr) throw new Error(`Thumbnail Upload: ${upErr.message}`)

        const { data: { publicUrl } } = supabase.storage.from('builds').getPublicUrl(path)
        thumbnailUrl = publicUrl
        thumbnailPath = path
      }

      // 2. Insert build record
      const { error: insertErr } = await supabase.from('builds').insert({
        id: buildId,
        name: name.trim(),
        description: description.trim() || null,
        thumbnail_url: thumbnailUrl,
        thumbnail_path: thumbnailPath,
        difficulty: difficulty || null,
        tags: tags,
      })
      if (insertErr) throw new Error(`Build speichern: ${insertErr.message}`)

      // 3. Upload step images + insert build_images
      if (stepImages.length > 0) {
        const imageRecords = []
        for (let i = 0; i < stepImages.length; i++) {
          const img = stepImages[i]
          const path = `${buildId}/steps/${i}-${img.file.name.replace(/\s+/g, '_')}`
          const { error: upErr } = await supabase.storage
            .from('builds')
            .upload(path, img.file, { upsert: false })
          if (upErr) throw new Error(`Bild ${i + 1} Upload: ${upErr.message}`)

          const { data: { publicUrl } } = supabase.storage.from('builds').getPublicUrl(path)
          imageRecords.push({
            build_id: buildId,
            url: publicUrl,
            path,
            order_index: i,
          })
        }

        const { error: imgErr } = await supabase.from('build_images').insert(imageRecords)
        if (imgErr) throw new Error(`Bilder speichern: ${imgErr.message}`)
      }

      setSuccess(true)
      reset()
      onBuildAdded()
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-form">
      {error && <div className="msg msg-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="msg msg-success" style={{ marginBottom: 16 }}>✓ Build erfolgreich erstellt!</div>}

      <div className="admin-section-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Name */}
        <div className="form-group">
          <label htmlFor="build-name">Build Name *</label>
          <input
            id="build-name"
            type="text"
            className="input"
            placeholder="z.B. Automatische Weizenfarm"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="build-desc">Beschreibung</label>
          <textarea
            id="build-desc"
            className="input"
            placeholder="Beschreibe den Build, seine Funktionsweise und Besonderheiten…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Difficulty */}
        <div className="form-group">
          <label htmlFor="build-difficulty">Schwierigkeitsgrad</label>
          <select
            id="build-difficulty"
            className="input"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            <option value="">— kein Wert —</option>
            <option value="anfaenger">Anfänger</option>
            <option value="fortgeschritten">Fortgeschritten</option>
            <option value="experte">Experte</option>
          </select>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label>Tags</label>
          <div className="tag-picker">
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag-chip${tags.includes(tag) ? ' tag-chip-active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Thumbnail */}
        <div className="form-group">
          <label>Thumbnail</label>
          {thumbnail ? (
            <div className="thumb-preview">
              <img src={thumbnail.preview} alt="Thumbnail Vorschau" />
              <button
                type="button"
                className="remove-thumb"
                onClick={() => { setThumbnail(null); thumbInputRef.current.value = '' }}
                aria-label="Thumbnail entfernen"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="file-drop" onClick={() => thumbInputRef.current.click()}>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbSelect}
                style={{ display: 'none' }}
              />
              <div className="file-drop-icon">🖼</div>
              <p>Klicken zum Auswählen</p>
              <small>PNG, JPG, WebP · empfohlen 16:9</small>
            </div>
          )}
        </div>

        {/* Step images */}
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label>Anleitungsbilder</label>
          <div
            className="file-drop"
            onClick={() => stepsInputRef.current.click()}
            style={{ marginBottom: stepImages.length > 0 ? 0 : undefined }}
          >
            <input
              ref={stepsInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleStepsSelect}
              style={{ display: 'none' }}
            />
            <div className="file-drop-icon">📷</div>
            <p>Mehrere Bilder auswählen</p>
            <small>Reihenfolge nach dem Hochladen sortierbar</small>
          </div>

          {stepImages.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={stepImages.map(img => img.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="sortable-list">
                  {stepImages.map((img, i) => (
                    <SortableImage
                      key={img.id}
                      id={img.id}
                      src={img.preview}
                      name={img.name}
                      index={i}
                      onRemove={removeStepImage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading || !name.trim()}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Wird hochgeladen…
            </>
          ) : '+ Build erstellen'}
        </button>
      </div>
    </form>
  )
}

// ── Admin Page ───────────────────────────────────────────
export default function Admin() {
  const { user } = useAuth()
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const fetchBuilds = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('builds')
      .select('*')
      .order('created_at', { ascending: false })
    setBuilds(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchBuilds() }, [fetchBuilds])

  async function handleDelete(build) {
    if (!confirm(`Build "${build.name}" wirklich löschen?`)) return
    setDeletingId(build.id)

    try {
      // 1. Collect all storage paths to delete
      const { data: images } = await supabase
        .from('build_images')
        .select('path')
        .eq('build_id', build.id)

      const paths = images?.map(img => img.path) || []
      if (build.thumbnail_path) paths.push(build.thumbnail_path)

      // 2. Delete files from storage (batch)
      if (paths.length > 0) {
        await supabase.storage.from('builds').remove(paths)
      }

      // 3. Delete build (build_images are cascade-deleted)
      await supabase.from('builds').delete().eq('id', build.id)

      setBuilds(prev => prev.filter(b => b.id !== build.id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>{user?.email}</p>
          </div>
          <div className="admin-badge">
            Live
          </div>
        </div>

        {/* Layout: builds list left, add form right */}
        <div className="admin-layout">
          {/* Builds list */}
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Vorhandene Builds</h2>
              <span className="count">{builds.length}</span>
            </div>

            <div className="admin-section-body">
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                  <div className="spinner" />
                </div>
              ) : builds.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>Noch keine Builds vorhanden.</p>
                </div>
              ) : (
                <div className="admin-builds-list">
                  {builds.map(build => (
                    <div key={build.id} className="admin-build-item">
                      {build.thumbnail_url ? (
                        <img
                          className="admin-build-thumb"
                          src={build.thumbnail_url}
                          alt={build.name}
                        />
                      ) : (
                        <div className="admin-build-thumb-placeholder">
                          <span>🧱</span>
                        </div>
                      )}

                      <div className="admin-build-info">
                        <div className="admin-build-name">{build.name}</div>
                        <div className="admin-build-date">
                          {new Date(build.created_at).toLocaleDateString('de-DE', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                          })}
                        </div>
                      </div>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(build)}
                        disabled={deletingId === build.id}
                        aria-label={`${build.name} löschen`}
                      >
                        {deletingId === build.id ? (
                          <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        ) : 'Löschen'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add form */}
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Neuen Build hinzufügen</h2>
            </div>
            <AddBuildForm onBuildAdded={fetchBuilds} />
          </div>
        </div>
      </div>
    </div>
  )
}
