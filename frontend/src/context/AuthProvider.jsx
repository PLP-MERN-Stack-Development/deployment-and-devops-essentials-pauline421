import React, { createContext, useState } from 'react'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [username, setUsername] = useState(null)

  return (
    <AuthContext.Provider value={{ username, setUsername }}>{children}</AuthContext.Provider>
  )
}

export default AuthProvider
