import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import HeroSection from "./components/HeroSection";
import * as api from "./api/chatApi";

function App() {
  const [chats, setChats] = useState([]);
  const [chat, setChat] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [message, setMessage] = useState("");

  const aiTextRef = useRef("");
  const bottomRef = useRef(null);

  const abortRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const loadChats = async () => {
    try {
      const data = await api.getChats();
      setChats(data);
    } catch (err) {
      console.error("Backend not reachable:", err);
    }
  };

  const newChat = async () => {
    try {
      const res = await api.newChat();
      setChatId(res.chat_id);
      setChat([]);
      loadChats();
    } catch (err) {
      console.error("newChat failed:", err);
    }
  };

  const openChat = async (id) => {
    try {
      setChatId(id);
      const msgs = await api.getMessages(id);
      setChat(msgs);
    } catch (err) {
      console.error("openChat failed:", err);
    }
  };

  const searchChats = async (q) => {
    try {
      setChats(q ? await api.searchChats(q) : await api.getChats());
    } catch (err) {
      console.error(err);
    }
  };

  const renameChat = async (id) => {
    const title = prompt("Rename archive:");
    if (!title) return;

    await api.renameChat(id, title);
    loadChats();
  };

  const deleteChat = async (id) => {
    await api.deleteChat(id);

    if (chatId === id) {
      setChat([]);
      setChatId(null);
    }

    loadChats();
  };

  const stopGenerating = () => {
    if (abortRef.current) abortRef.current.abort();
    setIsGenerating(false);
    window.speechSynthesis.cancel();
  };

  const send = async () => {
    if (!chatId || !message.trim()) return;

    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg = message;
    aiTextRef.current = "";
    setIsGenerating(true);

    setChat((p) => [...p, { role: "user", text: userMsg }]);
    setChat((p) => [...p, { role: "ai", text: "" }]);
    setMessage("");

    try {
      const res = await api.streamChat({
        message: userMsg,
        chat_id: chatId,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done || controller.signal.aborted) break;

        aiTextRef.current += decoder.decode(value, { stream: true });

        setChat((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = aiTextRef.current;
          return updated;
        });
      }
    } catch (err) {
      console.error("Stream failed:", err);
    }

    setIsGenerating(false);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white">

      <Sidebar
        chats={chats}
        onNew={newChat}
        onSelect={openChat}
        onDelete={deleteChat}
        onRename={renameChat}
        onSearch={searchChats}
      />

      <div className="flex-1 flex flex-col">

        {!chatId ? (
          <HeroSection onStart={newChat} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-10 py-8">
              <ChatWindow chat={chat} bottomRef={bottomRef} />
            </div>

            <div className="p-5 border-t border-white/10">
              <ChatInput
                message={message}
                setMessage={setMessage}
                send={send}
                stopGenerating={stopGenerating}
                isGenerating={isGenerating}
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default App;