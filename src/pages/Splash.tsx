import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoUrl from '../lib/logo.png'

export function Splash() {
  const navigate = useNavigate()
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setOpacity(0)
    }, 1300) // Start fading out before navigating

    const navTimer = setTimeout(() => {
      navigate('/setup', { replace: true })
    }, 1800)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(navTimer)
    }
  }, [navigate])

  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center bg-paper text-ink transition-opacity duration-500"
      style={{ opacity }}
    >
      <img src={logoUrl} alt="PyGrind Logo" className="mb-6 h-24 w-24 object-contain" />
      <h1 className="font-playfair text-4xl font-black uppercase tracking-widest text-ink">
        PYGRIND
      </h1>
      <p className="mt-4 font-mono-dm text-sm font-light tracking-wide text-ink-light">
        train like an engineer
      </p>
    </div>
  )
}
