import { useEffect, useRef } from 'react'
import Button from './Button'

export default function ConfirmDialog({ open, title, children, cancelLabel, confirmLabel, onCancel, onConfirm }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      className="w-full max-w-md overflow-hidden rounded-card bg-paper p-0 shadow-xl backdrop:bg-ink/50"
    >
      <h2 className="border-b border-line px-6 py-4 font-display text-lg font-bold tracking-tight text-ink">
        {title}
      </h2>
      <p className="px-6 py-6 text-sm text-muted">{children}</p>
      <div className="flex justify-end gap-2 border-t border-line bg-surface px-6 py-4">
        <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="destroy" className="px-3 py-1.5 text-xs" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
