require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const { router: roomsRoutes, rooms } = require('./routes/rooms');
const auth = require('./middleware/auth');
const { Server } = require('socket.io');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/rooms', auth, roomsRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded.user;
    next();
  } catch {
    next(new Error('Auth error'));
  }
});

io.on('connection', socket => {

  socket.on('joinRoom', roomId => {
    const room = rooms[roomId];
    if (!room) return socket.emit('errorMsg', 'Room not found');
    if (room.players.length >= 2) return socket.emit('errorMsg', 'Room full');
    room.players.push({ id: socket.id, username: socket.user.username });
    socket.join(roomId);
    io.to(roomId).emit('roomData', room.players);
  });

  socket.on('makeMove', ({ roomId, move }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.moves[socket.id] = move;

    if (Object.keys(room.moves).length === 2) {

      const moves = { ...room.moves };

      const [[idA, moveA], [idB, moveB]] = Object.entries(moves);
      const winMap = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
      let result;
      if (moveA === moveB) {
        result = 'draw';
      } else if (winMap[moveA] === moveB) {
        result = room.players.find(p => p.id === idA).username;
      } else {
        result = room.players.find(p => p.id === idB).username;
      }

      io.to(roomId).emit('roundResult', { moves, winner: result });

      room.moves = {};
    }
  });

  socket.on('disconnecting', () => {
    for (let roomId of socket.rooms) {
      if (rooms[roomId]) {
        rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
        io.to(roomId).emit('roomData', rooms[roomId].players);
        if (rooms[roomId].players.length === 0) delete rooms[roomId];
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
