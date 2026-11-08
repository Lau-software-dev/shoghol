// Demo accounts for Phase 1. There is no server: these live in React state (see AuthProvider) and are
// gone on reload. The names and emails match the posters and freelancers in gigs/seed.js, so signing
// in as Emma makes you the poster of her jobs. Every demo account uses DEMO_PASSWORD.

export const DEMO_PASSWORD = 'shoghol123'

const person = (name, skills) => {
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}@lau.edu`
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return { id: email, name, initials, email, skills, password: DEMO_PASSWORD }
}

export const makeUser = ({ name, email, skills, password }) => ({
  ...person(name.trim(), skills.trim()),
  id: email.trim().toLowerCase(),
  email: email.trim().toLowerCase(),
  password,
})

export const DEMO_USERS = [
  person('Emma Chakkour', 'Design, photography'),
  person('Karim Hawa', 'Tutoring, web development'),
  person('Giovanny Raad', 'Design, video editing'),
  person('Lea Haddad', 'Illustration'),
  person('Njteh Balian', 'Branding'),
]

/** What the rest of the app sees: never the password. */
export const publicUser = (user) => {
  if (!user) return null
  const { password: _hidden, ...rest } = user
  return rest
}
