// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [rooms, setRooms] = useState([]);

  // small helper: play a short notification tone using Web Audio API
  const playSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioContext()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      o.connect(g)
      g.connect(ctx.destination)
      g.gain.value = 0.05
      o.start()
      setTimeout(() => {
        o.stop()
        ctx.close()
      }, 120)
    } catch (e) {
      // ignore
    }
  }

  const requestBrowserNotification = async () => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch (e) {}
    }
  }

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit('user_join', username);
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message (with optional room and acknowledgment callback)
  // sendMessage(messageText, room?, callback?)
  const sendMessage = (message, roomOrCallback, maybeCallback) => {
    let room = undefined;
    let callback = undefined;
    if (typeof roomOrCallback === 'function') {
      callback = roomOrCallback;
    } else {
      room = roomOrCallback;
      callback = maybeCallback;
    }

    const payload = { message };
    if (room) payload.room = room;

    if (typeof callback === 'function') {
      socket.emit('send_message', payload, (ack) => callback(ack));
    } else {
      socket.emit('send_message', payload);
    }
  };

  // Send a private message (with optional acknowledgment callback)
  const sendPrivateMessage = (to, message, callback) => {
    if (typeof callback === 'function') {
      socket.emit('private_message', { to, message }, (ack) => callback(ack));
    } else {
      socket.emit('private_message', { to, message });
    }
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };

  // Join a room
  const joinRoom = (room) => {
    if (!room) return;
    socket.emit('join_room', room);
  };

  const leaveRoom = (room) => {
    if (!room) return;
    socket.emit('leave_room', room);
  };

  // Add reaction to a message
  const addReaction = (messageId, reaction) => {
    socket.emit('add_reaction', { messageId, reaction });
  };

  // Load messages for a room (paginated)
  const loadMessages = async (room, limit = 50, skip = 0) => {
    try {
      const url = new URL((import.meta.env.VITE_SOCKET_URL || SOCKET_URL) + '/api/messages');
      if (room) url.searchParams.set('room', room);
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('skip', String(skip));
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      // replace messages with loaded page (chronological oldest first)
      setMessages(data.messages || []);
      return data;
    } catch (e) {
      return { messages: [], total: 0 };
    }
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = (err) => {
      // Optionally log or expose error state; keeping minimal here
      // You can extend the hook to expose lastError if needed
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);

      // Play sound for incoming messages that are not from us
      if (message.senderId !== socket.id) {
        playSound()

        // Show browser notification when tab/window not focused
        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`${message.sender}`, { body: message.message })
          } catch (e) {}
        }
      }
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    // Read receipt events
    const onMessageRead = ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (String(m.id) === String(messageId)) {
            const readBy = Array.isArray(m.readBy) ? Array.from(new Set([...m.readBy, userId])) : [userId]
            return { ...m, readBy }
          }
          return m
        }),
      )
    }

    const onMessageReaction = ({ messageId, reactions }) => {
      setMessages((prev) => prev.map((m) => (String(m.id) === String(messageId) ? { ...m, reactions } : m)));
    }

    const onRoomList = (roomList) => {
      setRooms(roomList || []);
    }

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
  socket.on('message_reaction', onMessageReaction);
  socket.on('room_list', onRoomList);
  // request browser notification permission on connect
  socket.on('connect', () => requestBrowserNotification());
  socket.on('message_read', onMessageRead);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('message_reaction', onMessageReaction);
      socket.off('room_list', onRoomList);
      socket.off('message_read', onMessageRead);
    };
  }, []);

  // Mark a message as read (emit to server)
  const markMessageRead = (messageId) => {
    socket.emit('message_read', { messageId })
  }

  const getRooms = async () => {
    try {
      const url = (import.meta.env.VITE_SOCKET_URL || SOCKET_URL) + '/api/rooms'
      const res = await fetch(url)
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setRooms(data.rooms || [])
      return data.rooms || []
    } catch (e) {
      return []
    }
  }

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
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
  };
};

export default socket; 