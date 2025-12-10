const Chat = require("../../models/Chat");

function userEvents(io, socket) {
  socket.on("connect_user", async (userId) => {
    if (!userId) {
      console.error("connect_user failed: no userId provided");
      return;
    }

    socket.userId = userId;
    socket.join(userId);
    console.log(`User ${userId} joined personal room`);

    try {
      const chats = await Chat.find({ members: userId }).select("_id");
      chats.forEach((chat) => {
        socket.join(chat._id.toString());
        console.log(`User ${userId} joined chat room ${chat._id}`);
      });
    } catch (err) {
      console.error("Error joining chat rooms:", err.message);
    }
  });

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`Manually joined chat room ${chatId}`);
  });
}

module.exports = userEvents;
