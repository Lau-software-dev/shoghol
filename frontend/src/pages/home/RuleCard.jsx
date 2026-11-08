
export default function RuleCard({ title, text }) {
  return (
    <div className="rounded-card border border-line bg-paper p-5">
      <h3 className="font-display text-base font-bold tracking-tight text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-muted">{text}</p>
    </div>
  )
}
