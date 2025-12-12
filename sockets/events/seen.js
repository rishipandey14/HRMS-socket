const Message = require("../../models/Message");

function seenEvents(io, socket) {
  // Mark a single message as seen
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
      
      // Update status map
      if (!message.status) {
        message.status = new Map();
      }
      message.status.set(socket.userId, "seen");

      await message.save();

      io.to(message.chatId.toString()).emit("message_seen", {
        messageId,
        userId: socket.userId,
      });
    } catch (err) {
      console.error("message_seen socket error:", err.message);
    }
  });

  // Mark all messages in a chat as seen (when user opens/views a chat)
  socket.on("mark_chat_seen", async (chatId) => {
    try {
      // Update all messages in this chat where user is in unreadBy
      const result = await Message.updateMany(
        {
          chatId,
          senderId: { $ne: socket.userId },
          unreadBy: socket.userId,
        },
        {
          $pull: { unreadBy: socket.userId },
          $set: { [`status.${socket.userId}`]: "seen" },
        }
      );

      // Notify others in the chat that messages were seen
      io.to(chatId).emit("chat_messages_seen", {
        chatId,
        userId: socket.userId,
        count: result.modifiedCount,
      });
    } catch (err) {
      console.error("mark_chat_seen socket error:", err.message);
    }
  });
};

module.exports = seenEvents;