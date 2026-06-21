import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, NavLink, Route, Routes, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, GraduationCap, Home as HomeIcon } from 'lucide-react'
import { Setup } from './pages/Setup'
import { Home } from './pages/Home'
import { Learn } from './pages/Learn'
import { Handbook } from './pages/Handbook'
import { Splash } from './pages/Splash'
import { PageTransition } from './components/PageTransition'
import './index.css'

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <nav className="border-b border-ink-light/20 bg-ink text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <img src="/src/lib/logo.png" alt="Logo" className="h-6 w-6 object-contain invert" />
            <span className="font-playfair text-xl font-bold tracking-widest text-paper">PYGRIND</span>
            <span className="hidden font-mono-dm text-xs text-ink-light sm:inline-block">| train like an engineer</span>
          </div>
          <div className="flex items-center gap-1">
            <NavItem label="Learn" to="/learn" />
            <NavItem label="Handbook" to="/handbook" />
            <NavItem label="Practice" to="/practice" />
          </div>
        </div>
      </nav>
      <main className="flex flex-1 flex-col">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="border-t border-ink-light/20 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between font-mono-dm text-[0.6rem] uppercase text-ink-light">
          <span>© PyGrind</span>
          <a href="https://github.com/galihkjaya/code-learn.git" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">GitHub →</a>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter basename={normalizeBaseName(import.meta.env.BASE_URL)}>
      <Routes>
        {/* We will route / to Splash, and Setup / Brief next. */}
        <Route element={<Splash />} path="/" />
        <Route element={<PageTransition><Setup /></PageTransition>} path="/setup" />
        <Route element={<PageTransition><Home /></PageTransition>} path="/brief" />
        
        <Route element={<MainLayout />}>
          <Route element={<Learn />} path="/learn" />
          <Route element={<Learn />} path="/practice/:pathId" />
          <Route element={<Handbook />} path="/handbook" />
          <Route element={<Handbook />} path="/handbook/:slug" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

type NavItemProps = {
  label: string
  to: string
}

function NavItem({ label, to }: NavItemProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        `nav-link-ink inline-flex h-9 items-center gap-2 rounded-none px-4 py-2 font-mono-dm text-sm font-semibold transition-colors ${
          isActive ? 'active text-paper' : 'text-ink-light hover:text-paper'
        }`
      }
      end={to === '/learn'}
      to={to}
    >
      {label}
    </NavLink>
  )
}

function normalizeBaseName(baseUrl: string) {
  if (!baseUrl || baseUrl === '/') {
    return '/'
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
