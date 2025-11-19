// usersController.js
// Controller stub for users. Server.js currently emits user lists via sockets.

module.exports.getUsers = (req, res) => {
  res.json({ users: [], note: 'User controller stub. Use socket user_list event to retrieve connected users.' });
};
