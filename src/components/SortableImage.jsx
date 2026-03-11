import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function SortableImage({ id, src, name, index, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item${isDragging ? ' dragging' : ''}`}
    >
      {/* Drag handle */}
      <div
        className="drag-handle"
        {...attributes}
        {...listeners}
        title="Ziehen zum Sortieren"
        aria-label="Ziehen zum Sortieren"
      >
        <span />
        <span />
        <span />
      </div>

      {/* Order number */}
      <span className="sortable-order">#{index + 1}</span>

      {/* Thumbnail preview */}
      <img className="sortable-thumb" src={src} alt={name} />

      {/* File name */}
      <span className="sortable-name" title={name}>{name}</span>

      {/* Remove button */}
      <button
        type="button"
        className="sortable-remove"
        onClick={() => onRemove(id)}
        aria-label={`Bild entfernen: ${name}`}
        title="Entfernen"
      >
        ✕
      </button>
    </div>
  )
}
