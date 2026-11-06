// Stand-in until the owning team member builds the real surface.
export default function Placeholder({ title, spec, owner }) {
  return (
    <section>
      <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">
        Not built yet. Spec: <code className="font-mono">{spec}</code> · Owner: {owner}
      </p>
    </section>
  )
}
