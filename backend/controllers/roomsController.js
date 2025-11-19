// roomsController.js
// Controller stub for rooms. The running server currently keeps rooms in-memory inside server.js.

module.exports.getRooms = (req, res) => {
  res.json({ rooms: [], note: 'Room controller stub. server.js currently manages rooms in-memory.' });
};

module.exports.createRoom = (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'room name required' });
  // In a full implementation, persist room or update in-memory store
  res.status(201).json({ room: name, note: 'Room creation not persisted in stub.' });
};
