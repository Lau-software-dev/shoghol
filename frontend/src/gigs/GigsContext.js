import { createContext, useContext } from 'react'

export const GigsContext = createContext(null)

/**
 * { gigs, status, retry, save, add }
 * gigs is the one array of jobs, held in React state by GigsProvider. status is 'loading' | 'error' | 'ready'.
 * save(nextGig) replaces the job with the same id; add(gig) puts a new job first.
 */
export function useGigs() {
  const value = useContext(GigsContext)
  if (!value) throw new Error('useGigs must be used inside <GigsProvider>')
  return value
}
