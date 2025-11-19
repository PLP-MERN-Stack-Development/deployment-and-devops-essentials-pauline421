import React from 'react'

const UsersList = ({ users, currentId, onSelectUser, selectedUserId }) => {
  return (
    <aside className="users-list">
      <h3>Online</h3>
      <ul>
        {users.map((u) => (
          <li
            key={u.id}
            className={u.id === selectedUserId ? 'selected' : ''}
            onClick={() => onSelectUser && onSelectUser(u)}
          >
            <span className="user-name">{u.username}</span>
            {u.id === currentId ? <small> (you)</small> : null}
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default UsersList
