import { GIG_STATUS } from '../domain/gigStatus'
import { OFFER_STATUS } from '../domain/offers'

// Demo jobs for Phase 1. GigsProvider puts these in React state; they are gone on reload.
// Posters and freelancers are the demo accounts in auth/demoUsers.js.

export const SEED = [
  {
    id: 'logo-student-club',
    title: 'Logo for a student club',
    category: 'Design',
    description:
      'Robotics club, forming this term. We want a wordmark plus a round badge version for stickers. Two colours at most so it prints cheaply. Source files please, not just a PNG.',
    budget: 80,
    wantedBy: '2026-11-29',
    postedAt: '2026-11-02',
    poster: { name: 'Emma Chakkour', email: 'emma.chakkour@lau.edu' },
    status: GIG_STATUS.OPEN,
    offers: [
      offer('o1', 'Karim Hawa', 75, 5, 'I did the debate society badge last year, happy to show you.'),
      offer('o2', 'Giovanny Raad', 80, 4, 'Two concepts first, then we refine one. Source files in Figma and SVG.'),
      offer('o3', 'Njteh Balian', 60, 7, 'Cheaper because I want the portfolio piece. Slower though.'),
      offer('o4', 'Lea Haddad', 85, 3, 'Fast turnaround, and I print-test the badge at sticker size.'),
    ],
  },
  {
    id: 'calc-tutor',
    title: 'Calculus II tutor before the midterm',
    category: 'Tutoring',
    description:
      'Two sessions, 90 minutes each, on series and convergence tests. On campus, library study rooms. Bring past papers if you have them.',
    budget: 60,
    wantedBy: '2026-11-20',
    postedAt: '2026-11-04',
    poster: { name: 'Karim Hawa', email: 'karim.hawa@lau.edu' },
    status: GIG_STATUS.OPEN,
    offers: [offer('o5', 'Emma Chakkour', 55, 2, 'Got an A in it last spring, and I still have my notes.')],
  },
  {
    id: 'event-photos',
    title: 'Photos for the engineering fair',
    category: 'Photography',
    description: 'Three hours on Saturday, around 40 edited photos for the department page.',
    budget: 120,
    wantedBy: '2026-11-15',
    postedAt: '2026-10-28',
    poster: { name: 'Giovanny Raad', email: 'giovanny.raad@lau.edu' },
    status: GIG_STATUS.ASSIGNED,
    offers: [
      offer('o6', 'Emma Chakkour', 110, 2, 'I shot the spring fair, portfolio link on request.', OFFER_STATUS.ACCEPTED),
      offer('o7', 'Karim Hawa', 100, 3, 'Own camera and lenses.', OFFER_STATUS.AUTO_REJECTED),
    ],
  },
  {
    id: 'flyer-translation',
    title: 'Translate a flyer into French',
    category: 'Writing',
    description: 'One page, about 250 words, for the open day.',
    budget: 25,
    wantedBy: '2026-11-10',
    postedAt: '2026-10-30',
    poster: { name: 'Emma Chakkour', email: 'emma.chakkour@lau.edu' },
    status: GIG_STATUS.CANCELLED,
    offers: [],
  },
]

function offer(id, name, amount, days, message, status = OFFER_STATUS.PENDING) {
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}@lau.edu`
  return { id, freelancer: { name, email }, amount, days, message, status }
}
