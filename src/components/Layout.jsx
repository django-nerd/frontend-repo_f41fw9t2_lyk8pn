import { Link, NavLink, Outlet } from 'react-router-dom'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-blue-200 hover:text-white hover:bg-blue-600/40'}`}
    >
      {children}
    </NavLink>
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.08),transparent_35%)] pointer-events-none" />
      <header className="relative border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/40" />
            <span className="text-white font-bold text-lg">Career Hub</span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/quiz">Quiz</NavItem>
            <a href="/test" className="px-3 py-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-600/40">System Test</a>
          </nav>
        </div>
      </header>
      <main className="relative max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
      <footer className="relative border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 py-6 text-blue-200/70 text-sm">Built with Flames Blue</div>
      </footer>
    </div>
  )
}
