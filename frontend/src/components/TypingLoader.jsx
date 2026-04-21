export default function TypingLoader() {
  return (
    <div className="flex gap-1 px-4 py-3 msg">
      <span className="dot" />
      <span className="dot" style={{ animationDelay: "0.2s" }} />
      <span className="dot" style={{ animationDelay: "0.4s" }} />
    </div>
  );
}