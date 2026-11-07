// Same rules as worker/lib/users.js. Checked here so mistakes show at once; the server checks again.
export function validateRegister(f) {
  const errors = {}
  if (f.name.trim().length < 2) errors.name = 'Enter your full name.'
  if (!/^[^\s@]+@lau\.edu$/i.test(f.email.trim())) errors.email = 'That is not an @lau.edu address.'
  if (f.skills.trim().length < 2) errors.skills = 'Say what you do in a few words, so offers carry something to judge.'
  if (f.password.length < 8) errors.password = 'Too short. Use at least 8 characters.'
  return errors
}
