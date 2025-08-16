import React, { useEffect, useMemo, useState } from 'react'
import { api } from './api'
import { exerciseData, daysOfWeek } from './exerciseData'

function useAuth() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('academia_pro_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)
  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.auth.login(email, password)
      if (!res.success) throw new Error(res.error || 'Falha no login')
      localStorage.setItem('academia_pro_token', res.data.token)
      localStorage.setItem('academia_pro_user', JSON.stringify(res.data.user))
      setUser(res.data.user)
    } finally { setLoading(false) }
  }
  const register = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.auth.register(email, password)
      if (!res.success) throw new Error(res.error || 'Falha no registro')
      localStorage.setItem('academia_pro_token', res.data.token)
      localStorage.setItem('academia_pro_user', JSON.stringify(res.data.user))
      setUser(res.data.user)
    } finally { setLoading(false) }
  }
  const logout = () => {
    localStorage.removeItem('academia_pro_token')
    localStorage.removeItem('academia_pro_user')
    setUser(null)
  }
  return { user, login, register, logout, loading }
}

function Login({ onLogin, onRegister, loading }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const submit = (e) => {
    e.preventDefault()
    isLogin ? onLogin(email, password) : onRegister(email, password)
  }
  return (
    <div className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="card login">
        <h1 style={{ marginTop: 0 }}>Academia Pro</h1>
        <p className="small">Seu planejador de treinos baseado em ciência</p>
        <form onSubmit={submit} className="grid" style={{ gap: 12, margin: '16px 0' }}>
          <div>
            <label className="small">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="small">Senha</label>
            <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
          </div>
          <button className="btn" disabled={loading}>{isLogin ? 'Entrar' : 'Cadastrar'}</button>
        </form>
  {/* Demo login removido */}
        <div style={{ marginTop: 12 }}>
          <button className="small" style={{ background:'transparent', border:0, color:'#60a5fa', cursor:'pointer' }} onClick={()=>setIsLogin(v=>!v)}>
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Modal({ title, children, onClose, footer }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="btn secondary" onClick={onClose}>Fechar</button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
        {footer && <div style={{ marginTop: 12 }}>{footer}</div>}
      </div>
    </div>
  )
}

function Planner({ user, onLogout }) {
  const [plan, setPlan] = useState({})
  const [openDay, setOpenDay] = useState(null)
  // exerciseList is array of objects: { name: string, sets: [{ reps, weight }] }
  const [exerciseList, setExerciseList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api.workouts.get().then(res => {
      if (mounted) {
        setPlan(res?.data || {})
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [])

  const groups = useMemo(() => Object.keys(exerciseData), [])

  const saveDay = async () => {
    if (!openDay) return
  const muscles = [...new Set(exerciseList.flatMap(ex => Object.keys(exerciseData).filter(g => Object.values(exerciseData[g]).flat().includes(ex.name))))]
  const res = await api.workouts.saveDay(openDay, { muscles, exercises: exerciseList })
    if (res.success) {
  setPlan(p => ({ ...p, [openDay]: { muscles, exercises: exerciseList } }))
      setOpenDay(null)
      setExerciseList([])
    }
  }

  const deleteDay = async (dayKey) => {
    const res = await api.workouts.deleteDay(dayKey)
    if (res.success) setPlan(({ [dayKey]: _omit, ...rest }) => rest)
  }

  return (
    <div>
      <header>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
          <h2>Academia Pro</h2>
          <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
            <span className="small">{user?.email}</span>
            <button className="btn secondary" onClick={onLogout}>Sair</button>
          </div>
        </div>
      </header>
      <main className="container" style={{ paddingTop: 16 }}>
        <div style={{ textAlign:'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Meu Plano Semanal</h3>
          <p className="small">Baseado no Guia Mestre de Hipertrofia</p>
        </div>
        {loading ? <p>Carregando...</p> : (
          <div className="grid week">
            {daysOfWeek.map(day => {
              const dayPlan = plan[day.key] || { muscles: [], exercises: [] }
              const hasWorkout = dayPlan.exercises.length > 0
              return (
                <div key={day.key} className="card day-card">
                  <div className="day-header">
                    <strong>{day.name}</strong>
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: hasWorkout ? '#22c55e' : '#6b7280' }} />
                  </div>
                  <div className="small day-muscles">
                    {dayPlan.muscles.length ? dayPlan.muscles.join(', ') : 'Descanso'}
                  </div>
                  <div className="small day-exercises">
                    {dayPlan.exercises.map((ex,i)=>{
                      const name = typeof ex === 'string' ? ex : ex.name
                      const sets = typeof ex === 'string' ? [] : (ex.sets||[])
                      return (
                        <div key={i}>
                          • {name}
                          {sets.length>0 && (
                            <div className="small" style={{ opacity:.85, marginLeft: 8 }}>
                              {sets.map((s,si)=> <span key={si}>{si+1}ª: {s.reps}x{s.weight}kg{si<sets.length-1?', ':''}</span>)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="day-actions">
                    <button className="btn" onClick={() => { setOpenDay(day.key); setExerciseList(dayPlan.exercises) }}>{hasWorkout ? 'Editar' : 'Montar'}</button>
                    {hasWorkout && <button className="btn secondary" onClick={() => deleteDay(day.key)}>Limpar</button>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

    {openDay && (
        <Modal title={`Treino de ${daysOfWeek.find(d=>d.key===openDay)?.name}`} onClose={()=>setOpenDay(null)} footer={
          <div style={{ display:'flex', justifyContent:'flex-end', gap: 8 }}>
            <button className="btn secondary" onClick={()=>setOpenDay(null)}>Cancelar</button>
            <button className="btn" onClick={saveDay}>Salvar Treino</button>
          </div>
        }>
          <div className="grid planner-modal-grid" style={{ gap: 12 }}>
            <div className="card">
              <div className="small" style={{ marginBottom: 8 }}>Grupos Musculares</div>
              <div className="grid" style={{ gridTemplateColumns:'1fr', gap: 8 }}>
                {groups.map(g => (
                  <details key={g} className="card">
                    <summary style={{ cursor:'pointer' }}><strong>{g}</strong></summary>
                    <div className="grid" style={{ marginTop: 8 }}>
                      {Object.keys(exerciseData[g]).map(p => (
                        <details key={p}>
                          <summary style={{ cursor:'pointer' }}>{p}</summary>
                          <div style={{ marginTop: 6 }}>
                            {exerciseData[g][p].map(exName => {
                              const idx = exerciseList.findIndex(e => e.name === exName)
                              const checked = idx >= 0
                              return (
                                <div key={exName} style={{ padding: '4px 0' }}>
                                  <label style={{ display:'flex', alignItems:'center', gap: 8 }}>
                                    <input type="checkbox" checked={checked} onChange={(e)=>{
                                      setExerciseList(list => {
                                        if (e.target.checked) {
                                          if (idx >= 0) return list
                                          return [...list, { name: exName, sets: [] }]
                                        } else {
                                          return list.filter(item => item.name !== exName)
                                        }
                                      })
                                    }} />
                                    <span className="small">{exName}</span>
                                  </label>
                                  {checked && (
                                    <div className="small" style={{ marginLeft: 24, display:'grid', gap: 6 }}>
                                      {(exerciseList[idx]?.sets || []).map((s,si)=> (
                                        <div key={si} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:6, alignItems:'center' }}>
                                          <input type="number" min="0" placeholder="Reps" value={s.reps}
                                            onChange={e=>{
                                              const v = Number(e.target.value)
                                              setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: it.sets.map((ss,k)=> k===si ? { ...ss, reps: v } : ss) } : it))
                                            }} />
                                          <input type="number" min="0" placeholder="Kg" value={s.weight}
                                            onChange={e=>{
                                              const v = Number(e.target.value)
                                              setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: it.sets.map((ss,k)=> k===si ? { ...ss, weight: v } : ss) } : it))
                                            }} />
                                          <button className="btn secondary" onClick={()=>{
                                            setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: it.sets.filter((_,k)=>k!==si) } : it))
                                          }}>Remover</button>
                                        </div>
                                      ))}
                                      <button className="btn" onClick={()=>{
                                        setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: [...(it.sets||[]), { reps: 0, weight: 0 }] } : it))
                                      }}>Adicionar série</button>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="small"><strong>Resumo</strong></div>
              <div className="small" style={{ marginTop: 8 }}>{exerciseList.length} exercícios selecionados</div>
              <ul>
                {exerciseList.map(ex => <li key={ex} className="small">{ex}</li>)}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default function App() {
  const auth = useAuth()
  if (!auth.user) return <Login onLogin={auth.login} onRegister={auth.register} loading={auth.loading} />
  return <Planner user={auth.user} onLogout={auth.logout} />
}
