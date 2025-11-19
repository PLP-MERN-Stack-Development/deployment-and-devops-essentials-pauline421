import React, { useState, useEffect, useRef } from 'react'

const MessageInput = ({ onSend, onTyping, selectedUser, room }) => {
  const [text, setText] = useState('')
  const typingRef = useRef(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const handleChange = (e) => {
    setText(e.target.value)
    if (!typingRef.current) {
      typingRef.current = true
      onTyping && onTyping(true)
    }

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      typingRef.current = false
      onTyping && onTyping(false)
    }, 800)
  }

  const submit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSend && onSend(trimmed, selectedUser, room)
    setText('')
    typingRef.current = false
    onTyping && onTyping(false)
  }

  return (
    <form className="message-input" onSubmit={submit}>
        <input
        value={text}
        onChange={handleChange}
        placeholder={selectedUser ? `Message ${selectedUser.username} (private)` : room ? `Message room ${room}` : 'Type a message'}
        autoFocus
      />
      <button type="submit">Send</button>
    </form>
  )
}

export default MessageInput
