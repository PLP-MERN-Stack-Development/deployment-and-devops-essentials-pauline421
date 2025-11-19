import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthProvider'
import Chat from '../components/Chat'
import { SocketContext } from '../context/SocketProvider'

const ChatPage = () => {
  const { username } = useContext(AuthContext)
  const socketState = useContext(SocketContext)

  if (!username) return <div>Please login to access the chat</div>

  return <Chat username={username} socketState={socketState} />
}

export default ChatPage
