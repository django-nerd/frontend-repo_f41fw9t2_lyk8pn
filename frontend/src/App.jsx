import React, { useEffect, useMemo, useState } from 'react'

const safeLocalGet = (k, fallback=null) => {
  try { const v = localStorage.getItem(k); return v ?? fallback } catch { return fallback }
}
const safeLocalSet = (k, v) => { try { localStorage.setItem(k, v) } catch {} }

function ThemeToggle() {
  const [theme, setTheme] = useState(() => safeLocalGet('theme','dark') || 'dark')
  useEffect(()=>{
    const root = document.documentElement
    if(theme === 'light') root.classList.add('light'); else root.classList.remove('light')
    safeLocalSet('theme', theme)
  },[theme])
  return (
    <button className="btn" onClick={()=> setTheme(t=> t==='light'?'dark':'light')}>
      {theme==='light' ? '🌞 Light' : '🌙 Dark'}
    </button>
  )
}

function Header({ onSearch }){
  return (
    <header className="fade-in" style={{position:'sticky', top:0, zIndex:20, backdropFilter:'saturate(1.2) blur(8px)'}}> 
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem'}}>
        <div style={{display:'flex', gap:'.75rem', alignItems:'center'}}>
          <div style={{width:36, height:36, borderRadius:12, background:'linear-gradient(135deg, #7c5cff, #00d4ff)'}} />
          <strong>Student Career Hub</strong>
        </div>
        <div style={{display:'flex', gap:'.5rem', alignItems:'center'}}>
          <SearchBar onSearch={onSearch} compact />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function Card({ title, children, style }){
  return (
    <div className="glass fade-in" style={{padding:'1rem', borderRadius:'1rem', ...style}}>
      {title && <h3 style={{marginTop:0, marginBottom:'.5rem'}}>{title}</h3>}
      {children}
    </div>
  )
}

function SearchBar({ onSearch, compact }){
  const [q, setQ] = useState('')
  return (
    <div style={{display:'flex', gap:'.5rem', width: compact ? 380 : '100%'}}>
      <input className="input" placeholder="Search a career, skill, or course (e.g., Frontend Developer)" value={q} onChange={e=> setQ(e.target.value)} />
      <button className="btn" onClick={()=> onSearch?.(q)}>Search</button>
    </div>
  )
}

function Home({ onSearch }){
  return (
    <div className="fade-in" style={{display:'grid', gap:'1rem'}}>
      <section style={{display:'grid', gap:'1rem', placeItems:'center', textAlign:'center', padding:'3rem 1rem'}}>
        <iframe src="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{width:'100%', maxWidth:900, height:360, border:'none', borderRadius:16}} title="Spline Hero" />
        <h1 style={{margin:0, fontSize: '2.2rem'}}>Find your path in tech</h1>
        <p style={{margin:0, color:'var(--muted)'}}>Personalized learning plans, AI chat, interactive roadmaps, and more.</p>
        <div style={{marginTop:'1rem', width:'min(920px, 100%)'}}>
          <SearchBar onSearch={onSearch} />
        </div>
      </section>

      <section style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'1rem', padding:'0 1rem 2rem'}}>
        {['AI Engineer','Full-Stack Developer','Data Analyst','Mobile Developer'].map(t => (
          <Card key={t} title={t}>
            <p style={{color:'var(--muted)'}}>Click to explore a curated roadmap for {t}.</p>
            <button className="btn" onClick={()=> onSearch(t)}>Open roadmap</button>
          </Card>
        ))}
      </section>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="fade-in" style={{display:'grid', gap:'1rem'}}>
      <div className="glass" style={{height:18, width:'60%', borderRadius:8}}></div>
      <div className="glass" style={{height:120, borderRadius:16}}></div>
      <div className="glass" style={{height:120, borderRadius:16}}></div>
    </div>
  )
}

function Roadmap({ plan }){
  const steps = plan.learningPath || []
  return (
    <Card title="Interactive Roadmap">
      <svg viewBox={`0 0 ${steps.length*180+40} 160`} style={{width:'100%', height:180}}>
        <polyline fill="none" stroke="#7c5cff" strokeWidth="6" strokeLinecap="round" points={steps.map((_,i)=> `${40 + i*160},80`).join(' ')} />
        {steps.map((s, i)=> (
          <g key={i}>
            <circle cx={40 + i*160} cy={80} r={18} fill="#00d4ff" />
            <text x={40 + i*160} y={120} textAnchor="middle" fontSize="12" fill="currentColor">{s.title}</text>
          </g>
        ))}
      </svg>
    </Card>
  )
}

function StepDetails({ plan }){
  const steps = plan.learningPath || []
  return (
    <div style={{display:'grid', gap:'1rem'}}>
      {steps.map((s, idx)=> (
        <Card key={idx} title={`Step ${idx+1}: ${s.title}`}>
          <p style={{marginTop:0}}>{s.description}</p>
          <ul>
            {s.skillsToLearn?.map((k,i)=> <li key={i}>{k}</li>)}
          </ul>
          {s.videos?.length>0 && (
            <div style={{display:'grid', gap:'.5rem'}}>
              {s.videos.map((v,i)=> (
                <iframe key={i} src={v.url.replace('watch?v=','embed/')} title={v.title} style={{width:'100%', height:220, border:'none', borderRadius:12}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function useBackend() {
  const base = import.meta.env.VITE_BACKEND_URL || ''
  const token = safeLocalGet('token','') || ''
  const headers = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' }
  const post = async (path, body) => {
    const res = await fetch(base+path, { method:'POST', headers, body: JSON.stringify(body) })
    if(!res.ok) throw new Error(await res.text())
    return res.json()
  }
  const get = async (path) => {
    const res = await fetch(base+path, { headers })
    if(!res.ok) throw new Error(await res.text())
    return res.json()
  }
  return { post, get }
}

function AuthGate({ children, setAuthed }){
  const [view, setView] = useState('login')
  const [loading, setLoading] = useState(true)
  const apiBase = import.meta.env.VITE_BACKEND_URL || ''

  useEffect(()=>{
    const token = safeLocalGet('token','')
    if(!token){ setLoading(false); return }
    fetch(apiBase + '/api/auth/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token })})
      .then(r=> r.json()).then(d=> { if(d.valid){ setAuthed(true) } else { setLoading(false) }})
      .catch(()=> setLoading(false))
  },[])

  if(loading) return <div style={{padding:'2rem'}}><Skeleton/></div>

  return (
    <div className="fade-in" style={{display:'grid', placeItems:'center', padding:'2rem'}}>
      <Card title={view==='login'?'Welcome back':'Create your account'} style={{width:420}}>
        {view==='login' ? <Login onDone={()=> setAuthed(true)} /> : <Signup onDone={()=> setAuthed(true)} />}
        <div style={{display:'flex', justifyContent:'space-between', marginTop:'.75rem'}}>
          <button className="btn" onClick={()=> setView(view==='login'?'signup':'login')}>{view==='login'?'Create account':'Have an account? Login'}</button>
          <ThemeToggle />
        </div>
      </Card>
    </div>
  )
}

function Login({ onDone }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const base = import.meta.env.VITE_BACKEND_URL || ''
  const submit = async () => {
    setErr('')
    try{
      const r = await fetch(base + '/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })})
      if(!r.ok) throw new Error(await r.text())
      const d = await r.json()
      safeLocalSet('token', d.token)
      onDone?.()
    }catch(e){ setErr(String(e.message||e)) }
  }
  return (
    <div style={{display:'grid', gap:'.75rem'}}>
      <input className="input" placeholder="Email" value={email} onChange={e=> setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="Password" value={password} onChange={e=> setPassword(e.target.value)} />
      {err && <div style={{color:'#ff6b6b'}}>{err}</div>}
      <button className="btn" onClick={submit}>Login</button>
    </div>
  )
}

function Signup({ onDone }){
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const base = import.meta.env.VITE_BACKEND_URL || ''
  const submit = async () => {
    setErr('')
    try{
      const r = await fetch(base + '/api/auth/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ firstName, lastName, email, password })})
      if(!r.ok) throw new Error(await r.text())
      const d = await r.json()
      safeLocalSet('token', d.token)
      onDone?.()
    }catch(e){ setErr(String(e.message||e)) }
  }
  return (
    <div style={{display:'grid', gap:'.75rem'}}>
      <input className="input" placeholder="First name" value={firstName} onChange={e=> setFirstName(e.target.value)} />
      <input className="input" placeholder="Last name" value={lastName} onChange={e=> setLastName(e.target.value)} />
      <input className="input" placeholder="Email" value={email} onChange={e=> setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="Password" value={password} onChange={e=> setPassword(e.target.value)} />
      {err && <div style={{color:'#ff6b6b'}}>{err}</div>}
      <button className="btn" onClick={submit}>Create account</button>
    </div>
  )
}

export default function App(){
  const [authed, setAuthed] = useState(false)
  const [view, setView] = useState('home')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
  const backend = useBackend()

  const onSearch = async (q) => {
    setError(''); setLoading(true); setPlan(null); setView('results')
    try{
      const data = await backend.post('/api/gemini/learning-plan', { query: q })
      setPlan(data)
    }catch(e){ setError('Something went wrong generating your plan.') }
    finally{ setLoading(false) }
  }

  if(!authed) return <div className="app-shell"><AuthGate setAuthed={setAuthed} /></div>

  return (
    <div className="app-shell" style={{minHeight:'100%', paddingBottom:'3rem'}}>
      <Header onSearch={onSearch} />
      <main style={{maxWidth:1100, margin:'0 auto', padding:'1rem'}}>
        {view==='home' && <Home onSearch={onSearch} />}
        {view==='results' && (
          <div className="fade-in" style={{display:'grid', gap:'1rem'}}>
            {loading && <Skeleton />}
            {error && <Card title="Error"><div>{error}</div></Card>}
            {plan && (
              <>
                <Card title={plan.title}>
                  <p style={{marginTop:0}}>{plan.description}</p>
                  <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
                    {plan.keySkills?.map((k,i)=> <span key={i} className="glass" style={{padding:'.4rem .6rem', borderRadius:999}}>{k}</span>)}
                  </div>
                </Card>
                <Roadmap plan={plan} />
                <StepDetails plan={plan} />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
