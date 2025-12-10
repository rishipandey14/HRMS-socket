const axios = require("axios");
const messageEvents = require("./events/message");
const typingEvents = require("./events/typing");
const seenEvents = require("./events/seen");
const userEvents = require("./events/user");
const Chat = require("../models/Chat");

// Use localhost for local dev, task-tracker-backend for Docker
const TASK_TRACKER_URL = process.env.TASK_TRACKER_URL || 
  (process.env.NODE_ENV === "production" 
    ? "http://task-tracker-backend:7000" 
    : "http://localhost:7000");

const registerSocketHandlers = (io) => {
  io.on("connection", async (socket) => {
    console.log("New socket connected:", socket.id);

    socket.once("connect_user", async () => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          console.log("No auth token provided");
          return socket.disconnect();
        }

        // Verify token via task-tracker
        const response = await axios.get(`${TASK_TRACKER_URL}/api/auth/verify-token`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });

        if (!response.data?.user) {
          console.log("Token verification failed");
          return socket.disconnect();
        }

        const userId = response.data.user.id?.toString();
        socket.userId = userId;
        socket.userType = response.data.user.type;
        socket.userRole = response.data.user.role;

        socket.join(userId);
        console.log(`User ${userId} joined personal room`);

        const chats = await Chat.find({ members: userId }).select("_id");
        chats.forEach((chat) => {
          socket.join(chat._id.toString());
          console.log(`User ${userId} joined chat room ${chat._id}`);
        });
        // register events after identity set
        userEvents(io, socket);
        messageEvents(io, socket);
        typingEvents(io, socket);
        seenEvents(io, socket);
      } catch (err) {
        console.error("connect_user handler error:", err.message);
        socket.disconnect();
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = registerSocketHandlers;
