import { useCallback, useEffect, useMemo, useState } from 'react'
import { GigsContext } from './GigsContext'
import { SEED } from './seed'

// The jobs: one array in useState, shared with every page through context. Pages change it only with
// the pure rule functions in domain/offers.js (gig → next gig, or throw) followed by one save(), so a
// change is never half-applied and every page reading `gigs` re-renders together.
//
// Phase 1 has no server, so loading and failure are simulated on purpose (the brief asks for it):
//   delay      ms before the jobs "arrive" — the skeleton shows meanwhile
//   failFirst  the first load fails, so the error state and its retry can be shown
// In the app both can be set from the address bar: ?simulate=error, ?simulate=slow.
export default function GigsProvider({ children, initialGigs = SEED, delay = 400, failFirst = false }) {
  const [gigs, setGigs] = useState(initialGigs)
  const [status, setStatus] = useState(delay > 0 || failFirst ? 'loading' : 'ready')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (status !== 'loading') return
    const timer = setTimeout(() => setStatus(failFirst && attempt === 0 ? 'error' : 'ready'), delay)
    return () => clearTimeout(timer)
  }, [status, delay, failFirst, attempt])

  const retry = useCallback(() => {
    setAttempt((n) => n + 1)
    setStatus('loading')
  }, [])

  // Replace one job with its next version, in a single state update.
  const save = useCallback((next) => setGigs((all) => all.map((g) => (g.id === next.id ? next : g))), [])
  const add = useCallback((gig) => setGigs((all) => [gig, ...all]), [])

  const value = useMemo(() => ({ gigs, status, retry, save, add }), [gigs, status, retry, save, add])
  return <GigsContext.Provider value={value}>{children}</GigsContext.Provider>
}
