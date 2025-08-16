const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api'

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
