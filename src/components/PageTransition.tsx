import { useEffect, useState, ReactNode } from 'react'

export function PageTransition({ children, className = '' }: { children: ReactNode, className?: string }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Small delay to allow initial render, then trigger animation
    const timer = setTimeout(() => setShow(true), 10)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`transition-all duration-500 ease-in-out-custom ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  )
}
