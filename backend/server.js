// server.js - Main server file for Socket.io chat application

const express = require('express');
// server.js - Main server file for Socket.io chat application

// const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};
const rooms = new Set(); // Track known rooms (simple set)

// Message shape notes:
// {
//   id, sender, senderId, message, timestamp, isPrivate?, to?, readBy: [socketId...]
// }

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });
  // Handle chat messages (global or room)
  socket.on('send_message', (messageData, ack) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      readBy: [],
      reactions: {},
    };

    messages.push(message);

    // Limit stored messages to prevent memory issues
    if (messages.length > 1000) {
      messages.shift();
    }

    // If message specifies a room, emit only to that room
    if (message.room) {
      rooms.add(message.room);
      io.to(message.room).emit('receive_message', message);
      io.emit('room_list', Array.from(rooms));
    } else {
      io.emit('receive_message', message);
    }

    // support ack callback
    if (typeof ack === 'function') {
      try {
        ack({ status: 'ok', id: message.id });
      } catch (e) {}
    }
  });

  // Handle room join/leave
  socket.on('join_room', (room) => {
    if (!room) return;
    socket.join(room);
    rooms.add(room);
    // inform other room members
    socket.to(room).emit('room_member_joined', { room, user: users[socket.id] });
    // emit room list update
    io.emit('room_list', Array.from(rooms));
  });

  socket.on('leave_room', (room) => {
    if (!room) return;
    socket.leave(room);
    socket.to(room).emit('room_member_left', { room, user: users[socket.id] });
  });

  io.emit('typing_users', Object.values(typingUsers));

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
      to,
      readBy: [],
    };

    messages.push(messageData);


    // Add reaction to a message
    socket.on('add_reaction', ({ messageId, reaction }) => {
      const msg = messages.find((m) => String(m.id) === String(messageId));
      if (!msg) return;
      if (!msg.reactions) msg.reactions = {};
      const userId = socket.id;
      // Maintain reactions as mapping emoji -> set of userIds
      if (!msg.reactions[reaction]) msg.reactions[reaction] = [];
      if (!msg.reactions[reaction].includes(userId)) {
        msg.reactions[reaction].push(userId);
      }

      // broadcast reaction update
      io.emit('message_reaction', { messageId: msg.id, reactions: msg.reactions });
    });
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle message read receipts
  socket.on('message_read', ({ messageId }) => {
    const msg = messages.find((m) => String(m.id) === String(messageId));
    if (msg) {
      if (!Array.isArray(msg.readBy)) msg.readBy = [];
      if (!msg.readBy.includes(socket.id)) {
        msg.readBy.push(socket.id);
      }

      // Notify all clients about the read update (could be optimized to sender only)
      io.emit('message_read', { messageId: msg.id, userId: socket.id });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 