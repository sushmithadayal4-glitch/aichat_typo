export default function ChatWindow({ chat, bottomRef }) {
  return (
    <div className="space-y-6">

      {chat.map((c, i) => (
        <div
          key={i}
          className={`museum-fade flex ${
            c.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div className={`bubble ${c.role === "user" ? "bubble-user" : "bubble-ai"}`}>
            {c.text}
          </div>
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}