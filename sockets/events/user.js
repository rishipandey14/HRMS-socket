function userEvents(io, socket) {
  // identity already set in sockets/index.js via JWT; only allow manual room join
  socket.on("join_chat", (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
    console.log(`Manually joined chat room ${chatId}`);
  });
}

module.exports = userEvents;
