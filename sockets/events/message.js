const Message = require("../../models/Message");
const Chat = require("../../models/Chat");

function messageEvents(io, socket) {
  socket.on("send_message", async (data) => {
    try {
      if (!socket.userId) {
        console.error(
          "send_message error: socket.userId is undefined. Cannot send message.",
          { socketId: socket.id, socketData: socket.data }
        );
        return;
      }

      const { chatId, content, type } = data;
      if (!chatId || !content || !type) {
        console.error("send_message error: Missing data fields.", data);
        return;
      }

      console.log(`User ${socket.userId} sending message to chat ${chatId}`);

      const chat = await Chat.findById(chatId);
      if (!chat) {
        console.error("send_message error: Chat not found.");
        return;
      }

      const unreadBy = chat.members.filter(
        (memberId) => memberId.toString() !== socket.userId.toString()
      );

      const message = await Message.create({
        chatId,
        senderId: socket.userId,
        content,
        type,
        unreadBy,
        status: new Map([[socket.userId, "sent"]]), // Initialize sender's status
      });

      // Don't populate senderId - it references non-existent User model
      // Frontend will fetch user data separately via task-tracker
      const fullMessage = await Message.findById(message._id);

      chat.latestMessage = message._id;
      await chat.save();

      io.to(chatId).emit("receive_message", fullMessage);
    } catch (err) {
      console.error("send_message socket error:", err.message);
    }
  });

  socket.on("edit_message", async ({ messageId, newContent }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message || message.senderId.toString() !== socket.userId.toString())
        return;

      message.content = newContent;
      message.isEdited = true;
      await message.save();

      io.to(message.chatId.toString()).emit("edit_message", message);
    } catch (err) {
      console.error("edit_message error:", err.message);
    }
  });

  socket.on("delete_message", async (messageId) => {
    try {
      const message = await Message.findById(messageId);
      if (!message || message.senderId.toString() !== socket.userId.toString())
        return;

      // message.isDeleted = true;
      // message.content = "";
      // await message.save();
      await Message.findByIdAndDelete(messageId);

      io.to(message.chatId.toString()).emit("delete_message", messageId);
    } catch (err) {
      console.error("delete_message error:", err.message);
    }
  });
};

module.exports = messageEvents;
