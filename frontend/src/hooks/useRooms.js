import { useEffect, useState } from 'react'

export default function useRooms(socket) {
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    if (!socket) return
    const onRoomList = (list) => setRooms(list || [])
    socket.on('room_list', onRoomList)
    return () => socket.off('room_list', onRoomList)
  }, [socket])

  return { rooms, setRooms }
}
