import React, { createContext } from 'react'
import { useSocket } from '../socket'

export const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const socketState = useSocket()

  return <SocketContext.Provider value={socketState}>{children}</SocketContext.Provider>
}

export default SocketProvider
