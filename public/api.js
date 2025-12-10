const API_BASE = "http://localhost:5001/api";

function getToken() {
  return localStorage.getItem("token");
}

async function loginAPI(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error((await res.json()).message || "Login failed");
  return res.json();
}

async function registerAPI(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) throw new Error((await res.json()).message || "Register failed");
  return res.json();
}

async function getChats() {
  const res = await fetch(`${API_BASE}/chats`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function getChatById(chatId) {
  const res = await fetch(`${API_BASE}/chats/${chatId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function getMessages(chatId) {
  const res = await fetch(`${API_BASE}/messages/${chatId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function sendMessageAPI(chatId, content) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ chatId, content, type: "text" }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
