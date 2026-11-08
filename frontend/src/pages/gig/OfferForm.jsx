import { useState } from 'react'
import Button from '../../components/Button'
import TextField from '../../components/TextField'
import { NOTE_MAX, validateOffer } from './validateOffer'

/** The offer form. onSubmit({ amount, days, message }) may throw a RuleError; its message is shown. */
export default function OfferForm({ budget, onSubmit, onCancel }) {
  const [fields, setFields] = useState({ amount: String(budget), days: '', message: '' })
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (name) => (e) => {
    setFields((f) => ({ ...f, [name]: e.target.value }))
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }))
  }

  async function submit(event) {
    event.preventDefault()
    const found = validateOffer(fields)
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    setFailure(null)
    try {
      await onSubmit({ amount: Number(fields.amount), days: Number(fields.days), message: fields.message.trim() })
    } catch (err) {
      setFailure(err.message)
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-labelledby="offer-heading"
      className="mt-3 rounded-card border border-line bg-paper p-5"
    >
      <h2 id="offer-heading" className="font-display text-lg font-bold tracking-tight text-ink">
        Your offer
      </h2>
      <p className="mt-1 text-xs text-muted">Only the poster will see it. You can make one offer per job.</p>

      {failure && (
        <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-900">
          {failure}
        </p>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <TextField
          label="Your price (USD)"
          inputMode="numeric"
          value={fields.amount}
          onChange={set('amount')}
          error={errors.amount}
          hint={`The poster’s budget is $${budget}.`}
        />
        <TextField
          label="Days to deliver"
          inputMode="numeric"
          placeholder="5"
          value={fields.days}
          onChange={set('days')}
          error={errors.days}
        />
      </div>
      <div className="mt-5">
        <TextField
          multiline
          rows={3}
          label="A note to the poster"
          placeholder="What you have done before, how you would go about it."
          value={fields.message}
          onChange={set('message')}
          error={errors.message}
          hint={`${fields.message.trim().length} / ${NOTE_MAX}`}
        />
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="quiet" onClick={onCancel} disabled={busy}>
          Not now
        </Button>
        <Button type="submit" variant="propose" disabled={busy}>
          {busy ? 'Sending…' : 'Send offer'}
        </Button>
      </div>
    </form>
  )
}
