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
    room.scores[socket.id] = 0;

    socket.join(roomId);
    io.to(roomId).emit('roomData', {
      players: room.players,
      scores: room.scores
    });
  });

  socket.on('makeMove', ({ roomId, move }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.moves[socket.id] = move;

    if (Object.keys(room.moves).length === 2) {
      const [[idA, moveA], [idB, moveB]] = Object.entries(room.moves);
      const winMap = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
      let result;

      if (moveA === moveB) {
        result = 'draw';
        room.scores[idA] += 1;
        room.scores[idB] += 1;
      } else if (winMap[moveA] === moveB) {
        result = room.players.find(p => p.id === idA).username;
        room.scores[idA] += 2;
      } else {
        result = room.players.find(p => p.id === idB).username;
        room.scores[idB] += 2;
      }

      io.to(roomId).emit('roundResult', {
        moves: { ...room.moves },
        winner: result,
        scores: room.scores
      });

      room.moves = {};
    }
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      const room = rooms[roomId];
      if (!room) continue;

      // remove player & their score
      room.players = room.players.filter(p => p.id !== socket.id);
      delete room.scores[socket.id];

      io.to(roomId).emit('roomData', {
        players: room.players,
        scores: room.scores
      });

      if (room.players.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
