// The card both auth forms sit in (06-auth.html).
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-md rounded-card border border-line bg-paper">
      <div className="border-b border-line px-7 py-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      <div className="px-7 py-6">{children}</div>
    </div>
  )
}

export const linkClass = 'font-bold text-brand-700 underline decoration-accent-400 decoration-2 underline-offset-4'
