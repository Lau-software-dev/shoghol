import { useId } from 'react'

// A labelled input. A hint sits under it in grey; an error replaces the hint in red and is wired with
// aria-invalid + aria-describedby, so a screen reader announces it on the field (04-post.html, 06-auth.html).
const INPUT =
  'w-full rounded border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-4'
const OK = 'border-line focus:border-brand-500 focus:ring-brand-100'
const BAD = 'border-red-500 focus:border-red-600 focus:ring-red-100'

export default function TextField({ label, hint, error, id, multiline = false, ...inputProps }) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const msgId = `${fieldId}-msg`
  const message = error || hint
  const Input = multiline ? 'textarea' : 'input'

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </label>
      <Input
        id={fieldId}
        className={`${INPUT} ${error ? BAD : OK}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? msgId : undefined}
        {...inputProps}
      />
      {message && (
        <p id={msgId} className={error ? 'text-xs font-bold text-red-700' : 'text-xs text-muted'}>
          {message}
        </p>
      )}
    </div>
  )
}
