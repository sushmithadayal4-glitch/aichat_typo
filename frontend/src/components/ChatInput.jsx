import { Mic, Send } from "lucide-react";

export default function ChatInput({ message, setMessage, send }) {

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.onresult = (e) => setMessage(e.results[0][0].transcript);
    recog.start();
  };

  return (
    <div className="flex items-center gap-3">

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask the archive..."
        className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none transition"
      />

      <button onClick={startVoice} className="p-3 glass hover-lux">
        <Mic size={18} />
      </button>

      <button
        onClick={send}
        className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition"
      >
        <Send size={18} />
      </button>

    </div>
  );
}