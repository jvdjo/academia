// Prefer env-driven base URL; fallback to relative '/api' which works with the Vite proxy in dev and same-origin in prod
const envBase = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || ''
const baseUrl = (envBase || '/api').replace(/\/$/, '')

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': localStorage.getItem('academia_pro_token') ? `Bearer ${localStorage.getItem('academia_pro_token')}` : ''
})

export const api = {
  auth: {
  register: (email, password) => fetch(`${baseUrl}/auth/register`, { method:'POST', headers:{ 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })}).then(r=>r.json()),
  login: (email, password) => fetch(`${baseUrl}/auth/login`, { method:'POST', headers:{ 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })}).then(r=>r.json()),
  demo: () => fetch(`${baseUrl}/auth/demo`, { method:'POST', headers:{ 'Content-Type': 'application/json' }}).then(r=>r.json()),
  },
  workouts: {
    get: () => fetch(`${baseUrl}/workouts`, { headers: headers() }).then(r=>r.json()),
    saveDay: (day, data) => fetch(`${baseUrl}/workouts/${day}`, { method:'POST', headers: headers(), body: JSON.stringify({ ...data, day }) }).then(r=>r.json()),
    deleteDay: (day) => fetch(`${baseUrl}/workouts/${day}`, { method:'DELETE', headers: headers() }).then(r=>r.json()),
    stats: () => fetch(`${baseUrl}/workouts/stats`, { headers: headers() }).then(r=>r.json()),
  },
  exercises: {
    list: () => fetch(`${baseUrl}/exercises`).then(r=>r.json())
  }
}
