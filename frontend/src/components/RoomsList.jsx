import React from 'react'

const RoomsList = ({ rooms, currentRoom, onSelectRoom, unreadCounts = {} }) => {
  return (
    <div className="rooms-list">
      <h3>Rooms</h3>
      <ul>
        {rooms.map((r) => (
          <li
            key={r}
            className={r === currentRoom ? 'selected' : ''}
            onClick={() => onSelectRoom && onSelectRoom(r)}
          >
            <span className="room-name">{r}</span>
            {unreadCounts[r] ? <span className="badge">{unreadCounts[r]}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RoomsList
