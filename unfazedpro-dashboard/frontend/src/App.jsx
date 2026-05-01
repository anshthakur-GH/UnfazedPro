import React from 'react'
import Overview from './pages/Overview'
import Sidebar from './components/Sidebar'
import NotificationPanel from './components/NotificationPanel'

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', background: 'var(--bg-primary)' }}>
        <Overview />
      </main>
      <NotificationPanel />
    </div>
  )
}

export default App
