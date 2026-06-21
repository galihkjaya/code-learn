import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { BookOpen, GraduationCap, Home as HomeIcon } from 'lucide-react'
import { ApiKeySetup } from './components/ApiKeySetup'
import { Home } from './pages/Home'
import { Learn } from './pages/Learn'
import { Handbook } from './pages/Handbook'
import './index.css'

function App() {
  return (
    <BrowserRouter basename={normalizeBaseName(import.meta.env.BASE_URL)}>
      <div className="min-h-screen bg-slate-100">
        <ApiKeySetup />
        <nav className="border-b border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
            <NavItem icon={<HomeIcon className="h-4 w-4" />} label="Home" to="/" />
            <NavItem icon={<GraduationCap className="h-4 w-4" />} label="Learn" to="/learn" />
            <NavItem
              icon={<BookOpen className="h-4 w-4" />}
              label="Handbook"
              to="/handbook/python-oop.html"
            />
          </div>
        </nav>
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<Learn />} path="/learn" />
          <Route element={<Learn />} path="/learn/:pathId/:tier" />
          <Route element={<Handbook />} path="/handbook/:slug" />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

type NavItemProps = {
  icon: React.ReactNode
  label: string
  to: string
}

function NavItem({ icon, label, to }: NavItemProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        `inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
          isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`
      }
      end={to === '/'}
      to={to}
    >
      {icon}
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
