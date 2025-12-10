let socket;

function connectSocket(userId, token) {
  if (!userId || !token) {
    console.error("Missing userId or token for socket connection");
    return;
  }

  socket = io("http://localhost:5001", {
    auth: { token },
  });

  window.socket = socket;

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    console.log("Emitting connect_user with userId:", userId);
    socket.emit("connect_user", userId);
  });

  socket.on("receive_message", (msg) => {
    console.log("Received message:", msg);

    if (msg.chatId === window.currentChatId) {
      appendMessage(msg);
      clearUnread(msg.chatId);
      markMessageAsSeen(msg._id);
    } else {
      incrementUnread(msg.chatId);
    }
  });

  socket.on("typing", ({ chatId }) => {
    if (chatId === window.currentChatId) {
      const typingDiv = document.getElementById("typing-status");
      typingDiv.innerText = "Typing...";
      clearTimeout(window.typingTimer);
      window.typingTimer = setTimeout(() => {
        typingDiv.innerText = "";
      }, 2000);
    }
  });

  socket.on("stop_typing", ({ chatId }) => {
    if (chatId === window.currentChatId) {
      const typingDiv = document.getElementById("typing-status");
      typingDiv.innerText = "";
    }
  });

  socket.on("disconnect", () => {
    console.warn("Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });
}

function markMessageAsSeen(messageId) {
  if (socket && socket.connected) {
    socket.emit("message_seen", messageId);
  }
}
