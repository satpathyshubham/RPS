const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

let rooms = {}; 

router.post('/', (req, res) => {
  const id = uuidv4();
  rooms[id] = { players: [], moves: {} };
  res.json({ roomId: id });
});

router.get('/', (req, res) => {
  res.json(Object.keys(rooms));
});

module.exports = { router, rooms };
