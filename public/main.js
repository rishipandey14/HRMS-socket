let unreadCounts = {};
let typingTimeout;
let seenMessages = new Set();
let currentChatId = null;

async function login() {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const data = await loginAPI(email, password);

    window.currentUser = {
      _id: data._id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
    };

    localStorage.setItem("token", data.token);
    connectSocket(window.currentUser._id, data.token);

    document.getElementById("auth-container").style.display = "none";
    document.getElementById("chat-container").style.display = "flex";

    await loadChats();
  } catch (error) {
    document.getElementById("auth-error").innerText = error.message;
  }
}

async function register() {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const name = document.getElementById("name")?.value || "Unnamed";

    const data = await registerAPI(name, email, password);

    window.currentUser = {
      _id: data._id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
    };

    localStorage.setItem("token", data.token);
    connectSocket(window.currentUser._id, data.token);

    document.getElementById("auth-container").style.display = "none";
    document.getElementById("chat-container").style.display = "flex";

    await loadChats();
  } catch (e) {
    document.getElementById("auth-error").innerText = e.message;
  }
}

async function loadChats() {
  const chatList = document.getElementById("chat-list");
  chatList.innerHTML = "";

  const chats = await getChats();

  unreadCounts = {};
  chats.forEach((chat) => {
    unreadCounts[chat._id] = chat.unreadCount || 0;
  });

  chats.forEach((chat) => {
    const li = document.createElement("li");
    li.setAttribute("data-chatid", chat._id);

    let name;
    if (chat.isGroup) {
      name = chat.groupName;
    } else {
      const receiver = chat.members.find(
        (m) => m._id !== window.currentUser._id
      );
      name = receiver?.name || "1-1 Chat";
    }
    li.dataset.name = name;

    const unread = unreadCounts[chat._id] || 0;
    li.innerText = unread > 0 ? `${name} (${unread})` : name;
    li.onclick = () => openChat(chat._id);
    chatList.appendChild(li);
  });
}

async function updateChatListUI() {
  await loadChats();
}

async function openChat(chatId) {
  window.currentChatId = chatId;
  seenMessages.clear();
  clearUnread(chatId);

  const chat = await getChatById(chatId);
  const title = chat.isGroup
    ? chat.groupName
    : chat.members.find((m) => m._id !== window.currentUser._id)?.name ||
      "Chat";

  document.getElementById("chat-title").innerText = title;

  const msgs = await getMessages(chatId);
  const container = document.getElementById("messages");
  container.innerHTML = "";

  msgs.forEach((msg) => {
    appendMessage(msg);

    if (
      msg.senderId?._id !== window.currentUser._id &&
      !seenMessages.has(msg._id)
    ) {
      window.socket.emit("message_seen", msg._id);
      seenMessages.add(msg._id);
    }
  });

  if (window.socket) {
    window.socket.emit("join_chat", chatId);
  }
}

function appendMessage(msg) {
  const div = document.createElement("div");
  div.className = "message";

  if (msg.senderId && msg.senderId._id === window.currentUser._id) {
    div.classList.add("you");
  }

  const senderName = msg.senderId?.name || "User";
  div.innerText = `${senderName}: ${msg.content}`;

  const messagesDiv = document.getElementById("messages");
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const content = input.value.trim();

  if (!content || !window.currentChatId || !window.socket) return;

  window.socket.emit("send_message", {
    chatId: window.currentChatId,
    content,
    type: "text",
  });

  input.value = "";
}

document.getElementById("messageInput").addEventListener("input", () => {
  if (window.socket && window.currentChatId) {
    window.socket.emit("typing", {
      chatId: window.currentChatId,
      userName: window.currentUser.name,
    });

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      window.socket.emit("stop_typing", {
        chatId: window.currentChatId,
      });
    }, 1500);
  }
});

document.getElementById("messageInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function incrementUnread(chatId) {
  unreadCounts[chatId] = (unreadCounts[chatId] || 0) + 1;
  updateUnreadUI(chatId);
}

function clearUnread(chatId) {
  unreadCounts[chatId] = 0;
  updateUnreadUI(chatId);
}

function updateUnreadUI(chatId) {
  const li = document.querySelector(`li[data-chatid="${chatId}"]`);
  if (!li) return;

  const unread = unreadCounts[chatId] || 0;
  const baseName = li.dataset.name || "";

  li.innerText = unread > 0 ? `${baseName} (${unread})` : baseName;
}

function connectSocket(userId, token) {
  const socket = io("http://localhost:5001", {
    auth: { token },
  });

  window.socket = socket;

  socket.on("connect", () => {
    socket.emit("connect_user", userId);
  });

  socket.on("receive_message", (msg) => {
    if (msg.chatId === window.currentChatId) {
      appendMessage(msg);

      if (
        msg.senderId?._id !== window.currentUser._id &&
        !seenMessages.has(msg._id)
      ) {
        socket.emit("message_seen", msg._id);
        seenMessages.add(msg._id);
      }
    } else {
      incrementUnread(msg.chatId);
    }
  });

  socket.on("message_seen", ({ messageId, userId }) => {
    console.log(`Message ${messageId} seen by ${userId}`);
  });

  socket.on("typing", ({ chatId, userName }) => {
    if (chatId === window.currentChatId) {
      const typingDiv = document.getElementById("typing-indicator");
      typingDiv.style.display = "block";
      typingDiv.innerText = `${userName} is typing...`;

      if (window.typingIndicatorTimeout)
        clearTimeout(window.typingIndicatorTimeout);

      window.typingIndicatorTimeout = setTimeout(() => {
        typingDiv.style.display = "none";
        typingDiv.innerText = "";
      }, 2000);
    }
  });

  socket.on("stop_typing", ({ chatId }) => {
    if (chatId === window.currentChatId) {
      const typingDiv = document.getElementById("typing-indicator");
      typingDiv.style.display = "none";
      typingDiv.innerText = "";
    }
  });
}
