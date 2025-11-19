import { useState } from 'react'

export default function useMessages() {
  const [messages, setMessages] = useState([])

  const loadMessages = async (room, limit = 50, skip = 0) => {
    try {
      const url = new URL('/api/messages', window.location.origin)
      if (room) url.searchParams.set('room', room)
      url.searchParams.set('limit', String(limit))
      url.searchParams.set('skip', String(skip))
      const res = await fetch(url.toString())
      const data = await res.json()
      setMessages(data.messages || [])
      return data
    } catch (e) {
      return { messages: [], total: 0 }
    }
  }

  return { messages, setMessages, loadMessages }
}
