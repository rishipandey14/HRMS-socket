function typingEvents(io, socket) {
  socket.on("typing", ({ chatId, userName }) => {
    socket.to(chatId).emit("typing", {
      chatId, userName
    });
  });

  socket.on("stop_typing", ({ chatId }) => {
    socket.to(chatId).emit("stop_typing", {
      chatId
    });
  });
}

module.exports = typingEvents;
