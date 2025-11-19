import React, { useEffect, useRef } from 'react'

const MessageList = ({ messages, currentId, markMessageRead, addReaction }) => {
  const endRef = useRef(null)

  useEffect(() => {
    // scroll to bottom on new messages
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // mark unread messages as read when they arrive / are visible
  useEffect(() => {
    if (!markMessageRead) return
    messages.forEach((m) => {
      if (m.senderId !== currentId && (!m.readBy || !m.readBy.includes(currentId))) {
        markMessageRead(m.id)
      }
    })
  }, [messages, currentId, markMessageRead])

  return (
    <div className="message-list">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`message ${m.senderId === currentId ? 'mine' : ''} ${m.system ? 'system' : ''}`}
        >
          {!m.system && (
            <div className="message-meta">
              <strong>{m.sender}</strong>
              <span className="timestamp">{new Date(m.timestamp).toLocaleTimeString()}</span>
            </div>
          )}

          <div className="message-body">{m.message}</div>

          {/* reactions display */}
          <div className="message-reactions">
            {m.reactions && Object.keys(m.reactions).length > 0 ? (
              Object.entries(m.reactions).map(([emoji, users]) => (
                <button key={emoji} className="reaction-pill">
                  {emoji} {users.length}
                </button>
              ))
            ) : null}

            {/* quick add reactions */}
            {addReaction ? (
              <div className="reaction-actions">
                {['👍', '❤️', '😂', '😮'].map((r) => (
                  <button key={r} onClick={() => addReaction(m.id, r)} className="reaction-btn">
                    {r}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}

export default MessageList
