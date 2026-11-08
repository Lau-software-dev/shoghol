// The dashed "nothing here" panel (02-browse.html, 05-mine.html): say what is missing, then offer a way
// on. The buttons go in as children.
export default function EmptyState({ title, text, children }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
      <h3 className="font-display text-2xl font-bold tracking-[-0.015em] text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted">{text}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  )
}
