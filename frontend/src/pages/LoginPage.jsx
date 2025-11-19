import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthProvider'
import Login from '../components/Login'

const LoginPage = ({ onLogin }) => {
  const { setUsername } = useContext(AuthContext)
  const [error, setError] = useState(null)

  const handleLogin = (name) => {
    setUsername(name)
    onLogin && onLogin(name)
  }

  return (
    <div className="page login-page">
      <h2>Join the Chat</h2>
      <Login onLogin={handleLogin} />
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default LoginPage
