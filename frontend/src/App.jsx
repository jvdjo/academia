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
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  },[theme])
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
        <div className="theme-toggle">
          <button className="btn secondary" onClick={()=> setTheme(t=> t==='light' ? 'dark' : 'light')}>
            {theme==='light' ? 'Modo escuro' : 'Modo claro'}
          </button>
        </div>
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
        <div className="modal-header">
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="btn secondary" onClick={onClose}>Fechar</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

function Planner({ user, onLogout }) {
  const [plan, setPlan] = useState({})
  const [openDay, setOpenDay] = useState(null)
  // exerciseList is array of objects: { name: string, sets: [{ reps, weight }] }
  const [exerciseList, setExerciseList] = useState([])
  const [focusExercise, setFocusExercise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(max-width: 480px)').matches : false
  )
  const [openAccordionDay, setOpenAccordionDay] = useState(null)

  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  },[theme])

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

  // Track viewport to switch between grid and accordion on small screens
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(max-width: 480px)')
    const handler = (e) => setIsMobile(e.matches)
    mql.addEventListener ? mql.addEventListener('change', handler) : mql.addListener(handler)
    setIsMobile(mql.matches)
    return () => {
      mql.removeEventListener ? mql.removeEventListener('change', handler) : mql.removeListener(handler)
    }
  }, [])

  const groups = useMemo(() => Object.keys(exerciseData), [])

  const slug = (s='') => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

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

  const exportDayToPDF = (dayKey) => {
    if (!dayKey) return
    const day = daysOfWeek.find(d => d.key === dayKey)
    const dayPlan = plan[dayKey] || { muscles: [], exercises: [] }
    const rows = (dayPlan.exercises || []).map(ex => typeof ex === 'string' ? { name: ex, sets: [] } : ex)

    const styles = `
      body{ font-family: Inter, Arial, Helvetica, sans-serif; color:#111827; padding:20px }
      h1{ font-size:18px; margin:0 0 8px }
      .meta{ color:#6b7280; margin-bottom:12px }
      table{ width:100%; border-collapse:collapse; margin-top:12px }
      th,td{ border:1px solid #e5e7eb; padding:8px; text-align:left }
      th{ background:#f3f4f6 }
    `

    const tableRows = rows.length ? rows.map((r, i) => {
      const sets = (r.sets || []).map((s,si) => `${si+1}ª: ${s.reps}x${s.weight}kg`).join(' / ') || '-'
      return `<tr><td>${i+1}</td><td>${r.name}</td><td>${sets}</td></tr>`
    }).join('\n') : `<tr><td colspan="3" style="text-align:center">Descanso</td></tr>`

    const muscleList = dayPlan.muscles && dayPlan.muscles.length ? dayPlan.muscles.join(', ') : 'Descanso'

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Treino - ${day.name}</title><style>${styles}</style></head><body>
      <h1>Treino - ${day.name}</h1>
      <div class="meta">Grupos Musculares: ${muscleList} · ${rows.length} exercícios</div>
      <table>
        <thead><tr><th>#</th><th>Exercício</th><th>Séries / Repetições (ex.: reps x kg)</th></tr></thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body></html>`

    const w = window.open('', '_blank')
    if (!w) {
      alert('Não foi possível abrir a janela para exportar. Verifique se o bloqueador de pop-ups está ativo.')
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
    // Give browser a moment to render before printing
    setTimeout(() => {
      w.focus()
      w.print()
    }, 300)
  }

  // When opening the modal with a focused exercise, auto-expand and scroll to it
  useEffect(() => {
    if (openDay && focusExercise) {
      const id = slug(focusExercise)
      setTimeout(() => {
        const el = document.querySelector(`[data-ex-id="${id}"]`)
        if (el) {
          // Open ancestor <details> and scroll into view
          let parent = el.closest('details')
          while (parent) {
            parent.open = true
            parent = parent.parentElement && parent.parentElement.closest ? parent.parentElement.closest('details') : null
          }
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('pulse-highlight')
          setTimeout(() => el.classList.remove('pulse-highlight'), 1000)
        }
        // Clear focus flag so user can close/toggle freely afterwards
        setFocusExercise(null)
      }, 0)
    }
  }, [openDay, focusExercise])

  return (
    <div>
      <header>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h2>Academia Pro</h2>
          <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
            <button
              className={`btn secondary ${isMobile ? 'icon-btn' : ''}`}
              aria-label="Alternar tema"
              title="Alternar tema"
              onClick={()=> setTheme(t=> t==='light' ? 'dark' : 'light')}
            >
              {isMobile ? '🌓' : (theme==='light' ? 'Escuro' : 'Claro')}
            </button>
            <span className="small user-email">{user?.email}</span>
            <button
              className={`btn secondary ${isMobile ? 'icon-btn' : ''}`}
              aria-label="Sair"
              title="Sair"
              onClick={onLogout}
            >
              {isMobile ? '⎋' : 'Sair'}
            </button>
          </div>
        </div>
      </header>
      <main className="container" style={{ paddingTop: 16 }}>
        <div style={{ textAlign:'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Meu Plano Semanal</h3>
          <p className="small">Baseado no Guia Mestre de Hipertrofia</p>
        </div>
        {loading ? <p>Carregando...</p> : (
          <div className="accordion-list">
            {daysOfWeek.map(day => {
              const dayPlan = plan[day.key] || { muscles: [], exercises: [] }
              const hasWorkout = dayPlan.exercises.length > 0
              const muscleLabel = dayPlan.muscles && dayPlan.muscles.length ? dayPlan.muscles.join(', ') : 'Descanso'
              return (
                <details
                  key={day.key}
                  id={`day-${day.key}`}
                  className="day-accordion"
                  open={openAccordionDay === day.key}
                >
                  <summary
                    onClick={(e) => {
                      e.preventDefault()
                      setOpenAccordionDay(prev => {
                        const next = prev === day.key ? null : day.key
                        setTimeout(() => {
                          const el = document.getElementById(`day-${day.key}`)
                          if (el && next === day.key) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }, 0)
                        return next
                      })
                    }}
                  >
                    <span className="day-acc-left"><strong>{day.name}</strong><span className="muscle-label">{muscleLabel}</span></span>
                    <span className="day-acc-right">
                      <span className="pill">{dayPlan.exercises.length} exer.</span>
                      <span className="status-dot" style={{ background: hasWorkout ? '#22c55e' : '#6b7280' }} />
                    </span>
                  </summary>
                  <div className="accordion-body">
                    <div className="small day-muscles">
                      {dayPlan.muscles.length
                        ? dayPlan.muscles.map(m => <span key={m} className="badge">{m}</span>)
                        : <span className="muted">Descanso</span>}
                    </div>
                    <div className="small day-exercises">
                      {dayPlan.exercises.map((ex,i)=>{
                        const name = typeof ex === 'string' ? ex : ex.name
                        const sets = typeof ex === 'string' ? [] : (ex.sets||[])
                        return (
                          <div key={i} className="exercise-item" onClick={() => {
                            const normalized = (dayPlan.exercises || []).map(ex => typeof ex === 'string' ? ({ name: ex, sets: [] }) : ex)
                            setOpenDay(day.key)
                            setExerciseList(normalized)
                            setFocusExercise(name)
                          }}>
                            • {name}
                            {sets.length>0 && (
                              <span style={{ opacity:.85, marginLeft: 6 }}>
                                {sets.map((s,si)=> <span key={si}>{si+1}ª: {s.reps}x{s.weight}kg{si<sets.length-1?', ':''}</span>)}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="day-actions">
                      <button className="btn" onClick={() => {
                        setOpenDay(day.key);
                        const normalized = (dayPlan.exercises || []).map(ex => typeof ex === 'string' ? ({ name: ex, sets: [] }) : ex)
                        setExerciseList(normalized)
                      }}>{hasWorkout ? 'Editar' : 'Montar'}</button>
                      {hasWorkout && <button className="btn secondary" onClick={() => deleteDay(day.key)}>Limpar</button>}
                    </div>
                  </div>
                </details>
              )
            })}
          </div>
        )}
      </main>

    {openDay && (
        <Modal title={`Treino de ${daysOfWeek.find(d=>d.key===openDay)?.name}`} onClose={()=>setOpenDay(null)} footer={
          <div style={{ display:'flex', justifyContent:'flex-end', gap: 8 }}>
            <button className="btn secondary" onClick={()=>setOpenDay(null)}>Cancelar</button>
            <button className="btn secondary" onClick={()=>exportDayToPDF(openDay)}>Exportar PDF</button>
            <button className="btn" onClick={saveDay}>Salvar Treino</button>
          </div>
        }>
              <div className="grid planner-modal-grid" style={{ gap: 12 }}>
            <div className="card">
              <div className="small" style={{ marginBottom: 8 }}>Grupos Musculares</div>
              <div className="grid" style={{ gridTemplateColumns:'1fr', gap: 8 }}>
                {groups.map(g => (
                  <details key={g} className="card muscle-group">
                    <summary style={{ cursor:'pointer' }}><strong>{g}</strong></summary>
                    <div className="grid" style={{ marginTop: 8 }}>
                      {Object.keys(exerciseData[g]).map(p => (
                        <details key={p} className="muscle-portion">
                          <summary style={{ cursor:'pointer' }}>{p}</summary>
                          <div className="exercise-list" style={{ marginTop: 6 }}>
              {exerciseData[g][p].map(exName => {
                              const idx = exerciseList.findIndex(e => e.name === exName)
                              const checked = idx >= 0
                              return (
                <div key={exName} data-ex-id={slug(exName)} className="exercise-row" style={{ padding: '4px 0' }}>
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
                                    <div className="small set-list" style={{ marginLeft: 24 }}>
                                      {(exerciseList[idx]?.sets || []).map((s,si)=> (
                                        <div key={si} className="set-item">
                                          <label className="small" htmlFor={`reps-${idx}-${si}`}>Repetições</label>
                                          <input id={`reps-${idx}-${si}`} type="number" min="0" inputMode="numeric" placeholder="Ex.: 8" value={s.reps}
                                            onChange={e=>{
                                              const v = Number(e.target.value)
                                              setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: it.sets.map((ss,k)=> k===si ? { ...ss, reps: v } : ss) } : it))
                                            }} />
                                          <label className="small" htmlFor={`weight-${idx}-${si}`} style={{ marginTop: 6 }}>Carga (kg)</label>
                                          <input id={`weight-${idx}-${si}`} type="number" min="0" step="0.5" inputMode="decimal" placeholder="Ex.: 20" value={s.weight}
                                            onChange={e=>{
                                              const v = Number(e.target.value)
                                              setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: it.sets.map((ss,k)=> k===si ? { ...ss, weight: v } : ss) } : it))
                                            }} />
                                          <div className="set-actions">
                                            <button className="btn secondary" onClick={()=>{
                                              setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: it.sets.filter((_,k)=>k!==si) } : it))
                                            }}>Remover</button>
                                          </div>
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
                {exerciseList.map((ex, i) => (
                  <li key={ex.name || i} className="small">
                    {ex.name}
                    {ex.sets && ex.sets.length > 0 && (
                      <span style={{ marginLeft: 6, opacity:.85 }}>
                        (
                        {ex.sets.map((s, si) => (
                          <span key={si}>{si+1}ª: {s.reps}x{s.weight}kg{si<ex.sets.length-1?', ':''}</span>
                        ))}
                        )
                      </span>
                    )}
                  </li>
                ))}
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
