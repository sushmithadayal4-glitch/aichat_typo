const BASE_URL = "http://localhost:5000";

// CHAT
export const newChat = async () => {
  const res = await fetch(`${BASE_URL}/new_chat`, {
    method: "POST",
  });
  return res.json();
};

export const getChats = async () => {
  const res = await fetch(`${BASE_URL}/chats`);
  return res.json();
};

export const getMessages = async (id) => {
  const res = await fetch(`${BASE_URL}/messages/${id}`);
  return res.json();
};

export const searchChats = async (q) => {
  const res = await fetch(`${BASE_URL}/search?q=${q}`);
  return res.json();
};

export const renameChat = async (id, title) => {
  const res = await fetch(`${BASE_URL}/rename_chat/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return res.json();
};

export const deleteChat = async (id) => {
  const res = await fetch(`${BASE_URL}/delete_chat/${id}`, {
    method: "DELETE",
  });
  return res.json();
};

export const undoDelete = async (id) => {
  const res = await fetch(`${BASE_URL}/undo_delete/${id}`, {
    method: "POST",
  });
  return res.json();
};

export const streamChat = async (data) => {
  return fetch(`${BASE_URL}/chat_stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};