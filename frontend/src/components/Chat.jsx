import React, { useState, useEffect } from 'react'
import UsersList from './UsersList'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import RoomsList from './RoomsList'

const Chat = ({ username, socketState }) => {
  const {
    socket,
    messages,
    users,
    typingUsers,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    markMessageRead,
    rooms,
    joinRoom,
    leaveRoom,
    addReaction,
    loadMessages,
    getRooms,
  } = socketState

  const [selectedUser, setSelectedUser] = useState(null)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [unreadCounts, setUnreadCounts] = useState({})

  useEffect(() => {
    // initial rooms
    getRooms().catch(() => {})
  }, [])

  // update unread counts when new messages arrive
  useEffect(() => {
    if (!messages || messages.length === 0) return
    const last = messages[messages.length - 1]
    if (!last) return
    // ignore own messages
    if (last.senderId === socket.id) return

    const room = last.room || 'global'
    if (room !== (currentRoom || 'global')) {
      setUnreadCounts((prev) => ({ ...(prev || {}), [room]: (prev[room] || 0) + 1 }))
    }
  }, [messages])

  const handleSend = (messageText, toUser, room) => {
    if (toUser && toUser.id && toUser.id !== socket.id) {
      sendPrivateMessage(toUser.id, messageText)
    } else {
      sendMessage(messageText, room)
    }
  }

  const handleSelectUser = (user) => {
    // toggle selection
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser(null)
    } else {
      setSelectedUser(user)
    }
  }

  const handleSelectRoom = async (room) => {
    if (currentRoom === room) return
    if (currentRoom) leaveRoom(currentRoom)
    setCurrentRoom(room)
    joinRoom(room)
    // load recent messages for the room
    const data = await loadMessages(room, 50, 0)
    // clear unread for this room and mark messages read
    setUnreadCounts((prev) => ({ ...(prev || {}), [room]: 0 }))
    if (data && data.messages) {
      data.messages.forEach((m) => {
        if (m.senderId !== socket.id) markMessageRead(m.id)
      })
    }
  }

  return (
    <div className="chat-layout">
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <RoomsList rooms={rooms} currentRoom={currentRoom} onSelectRoom={handleSelectRoom} unreadCounts={unreadCounts} />
        <UsersList
          users={users}
          currentId={socket.id}
          onSelectUser={handleSelectUser}
          selectedUserId={selectedUser?.id}
        />
      </aside>

      <section className="chat-area">
        <div className="chat-info">
          <h2>Welcome, {username} {currentRoom ? ` — ${currentRoom}` : ''}</h2>
          <div className="typing-indicator">
            {typingUsers && typingUsers.length > 0 ? (
              <small>{typingUsers.join(', ')} typing...</small>
            ) : (
              <small>Online: {users.length}</small>
            )}
          </div>
        </div>

  <MessageList messages={messages} currentId={socket.id} markMessageRead={markMessageRead} addReaction={addReaction} />

        <MessageInput onSend={handleSend} onTyping={setTyping} selectedUser={selectedUser} room={currentRoom} />
      </section>
    </div>
  )
}

export default Chat
