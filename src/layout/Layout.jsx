import { Outlet } from 'react-router-dom'
import SiteHeader from './SiteHeader'

export default function Layout() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>
      <footer className="mx-auto mt-20 max-w-6xl border-t border-line px-4 py-8 text-xs text-muted">
        <span className="font-display font-bold tracking-wide">SHOGHOL</span> · CSC443 Web Programming · Fall 2026
      </footer>
    </>
  )
}
