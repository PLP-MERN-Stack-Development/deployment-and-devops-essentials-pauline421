import React, { useState } from 'react'
import './App.css'
import { useSocket } from './socket'
import Login from './components/Login'
import Chat from './components/Chat'

function App() {
  const socketState = useSocket()
  const [username, setUsername] = useState(null)

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Socket.io Chat</h1>
        <p className="subtitle">Real-time communication demo</p>
      </header>

      <main>
        {!username ? (
          <Login
            onLogin={(name) => {
              setUsername(name)
              socketState.connect(name)
            }}
          />
        ) : (
          <Chat username={username} socketState={socketState} />
        )}
      </main>
    </div>
  )
}

export default App
