import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function App() {
  return (
    <main>
      <h1>CodeLearn</h1>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
