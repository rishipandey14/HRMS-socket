const Message = require("../../models/Message");

function seenEvents(io, socket) {
  socket.on("message_seen", async (messageId) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;

      if (!Array.isArray(message.unreadBy)) {
        message.unreadBy = [];
      }

      message.unreadBy = message.unreadBy.filter(
        (userId) => userId.toString() !== socket.userId.toString()
      );

      await message.save();

      io.to(message.chatId.toString()).emit("message_seen", {
        messageId,
        userId: socket.userId,
      });
    } catch (err) {
      console.error("message_seen socket error:", err.message);
    }
  });
};

module.exports = seenEvents;