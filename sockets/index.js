const messageEvents = require("./events/message");
const typingEvents = require("./events/typing");
const seenEvents = require("./events/seen");
const userEvents = require("./events/user");
const Chat = require("../models/Chat");
const jwt = require("../config/jwt");

const registerSocketHandlers = (io) => {
  io.on("connection", async (socket) => {
    console.log("New socket connected:", socket.id);

    socket.once("connect_user", async (userId) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          console.log("No auth token provided");
          return socket.disconnect();
        }

        const decoded = jwt.verifyToken(token);
        socket.userId = decoded.id;

        console.log(`connect_user event received: userId=${userId}`);
        socket.userId = userId;

        socket.join(userId);
        console.log(`User ${userId} joined personal room`);

        const chats = await Chat.find({ members: userId }).select("_id");
        chats.forEach((chat) => {
          socket.join(chat._id.toString());
          console.log(`User ${userId} joined chat room ${chat._id}`);
        });

        userEvents(io, socket);
        messageEvents(io, socket);
        typingEvents(io, socket);
        seenEvents(io, socket);
      } catch (err) {
        console.error("connect_user handler error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = registerSocketHandlers;
