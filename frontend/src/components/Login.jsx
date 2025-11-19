import React, { useState } from 'react'

const Login = ({ onLogin }) => {
  const [name, setName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onLogin(trimmed)
    setName('')
  }

  return (
    <div className="login">
      <form onSubmit={submit} className="login-form">
        <label htmlFor="username">Please enter a display name</label>
        <input
          id="username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoFocus
        />
        <button type="submit">Join Chat</button>
      </form>
    </div>
  )
}

export default Login
