export default function MessageBubble({ role, text }) {
  return (
    <div
      className={`max-w-xl p-4 rounded-2xl ${
        role === "user"
          ? "ml-auto bg-primary"
          : "bg-gray-800"
      }`}
    >
      {text}
    </div>
  );
}